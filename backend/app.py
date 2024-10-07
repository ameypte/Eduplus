from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

course_data = pd.read_csv(r'C:\CollegeStuff\Educampus Student reg\unique_course_program_year_mappings.csv')
job_data = pd.read_csv(r'C:\CollegeStuff\Educampus Student reg\complete_courses_with_job_mappings.csv')
new_course_data = pd.read_csv(r'C:\CollegeStuff\Educampus Student reg\sample_webpage\unique_mappings.csv')

course_data.columns = course_data.columns.str.lower()
job_data.columns = job_data.columns.str.lower()
new_course_data.columns = new_course_data.columns.str.lower()

@app.route('/api/programs', methods=['GET'])
def get_programs():
    """Get a list of unique programs."""
    programs = course_data['program'].unique().tolist()
    return jsonify(programs)

@app.route('/api/years', methods=['GET'])
def get_years():
    """Get a list of unique years."""
    years = course_data['year'].unique().tolist()
    return jsonify(years)

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """Get a list of unique jobs from job mappings."""
    job_mapping_1 = job_data['job mapping 1'].unique().tolist()
    job_mapping_2 = job_data['job mapping 2'].unique().tolist()
    unique_jobs = list(set(job_mapping_1) | set(job_mapping_2)) 
    return jsonify(unique_jobs)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get courses based on selected program and year."""
    program = request.args.get('program')
    year = request.args.get('year')

    if not program or not year:
        return jsonify({"error": "Program and year parameters are required."}), 400

    filtered_courses = new_course_data[(new_course_data['program'] == program) & (new_course_data['year'] == year)]
    
    if filtered_courses.empty:
        return jsonify({"error": "No courses found for the specified program and year."}), 404

    courses = filtered_courses[['course name', 'sem']].drop_duplicates().to_dict(orient='records')
    return jsonify(courses)

@app.route('/api/courses_by_job', methods=['GET'])
def get_courses_by_job():
    """Get courses corresponding to the selected job."""
    job = request.args.get('job')

    if not job:
        return jsonify({"error": "Job parameter is required."}), 400

    courses_job = job_data[(job_data['job mapping 1'] == job) | (job_data['job mapping 2'] == job)]

    if courses_job.empty:
        return jsonify({"error": "No courses found for the specified job."}), 404

    courses = courses_job['course name'].unique().tolist()
    return jsonify(courses)

@app.route('/api/common_courses', methods=['GET'])
def get_common_courses():
    """Get common courses between selected program/year and job."""
    program = request.args.get('program')
    year = request.args.get('year')
    job = request.args.get('job')

    if not program or not year or not job:
        return jsonify({"error": "Program, year, and job parameters are required."}), 400

    program_courses = new_course_data[(new_course_data['program'] == program) & (new_course_data['year'] == year)][['course name', 'sem']]

    courses_program_year = program_courses.set_index('course name')['sem'].to_dict()

    courses_job = job_data[(job_data['job mapping 1'] == job) | (job_data['job mapping 2'] == job)]['course name'].unique().tolist()

    common_courses = [course for course in courses_job if course in courses_program_year]

    if not common_courses:
        return jsonify({"message": "No common courses found."}), 404

    common_courses_with_sem = [{"course name": course, "sem": courses_program_year[course]} for course in common_courses]

    return jsonify(common_courses_with_sem)

@app.route('/api/courses_by_program_and_job', methods=['GET'])
def get_courses_by_program_and_job():
    """Get course details (year, sem, course name) based on program and job."""
    program = request.args.get('program')
    job = request.args.get('job')

    if not program or not job:
        return jsonify({"error": "Program and job parameters are required."}), 400

    job_courses = job_data[(job_data['job mapping 1'] == job) | (job_data['job mapping 2'] == job)]['course name'].unique()

    program_courses = new_course_data[new_course_data['program'] == program]

    result_courses = program_courses[program_courses['course name'].isin(job_courses)]

    if result_courses.empty:
        return jsonify({"error": "No courses found for the specified program and job."}), 404

    result_courses_sorted = result_courses.sort_values(by=['course name', 'year', 'sem'])

    result_data = result_courses_sorted[['year', 'sem', 'course name']].drop_duplicates().to_dict(orient='records')
    
    return jsonify(result_data)

if __name__ == '__main__':
    app.run(debug=True)
