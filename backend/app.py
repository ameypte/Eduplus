from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # Import the CORS module
import json
import google.generativeai as genai

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configure the Gemini model
genai.configure(api_key="AIzaSyDCMLuZmlYPXB6PIm0piJxku2Wq08RvlQE")
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Load the JSON file
with open("./data/work_program_dict.json", "r") as f:
    work_program_dict = json.load(f)

@app.route('/get_branches', methods=['GET'])
def index():
    branches = list(work_program_dict.keys())  # Get branch dropdown options
    # Return the branches as a JSON response
    return jsonify({'branches': branches})

@app.route('/get_years', methods=['POST'])
def get_years():
    branch = request.json.get("branch")
    if branch in work_program_dict:
        years = list(work_program_dict[branch].keys())  # Get year options for the selected branch
        return jsonify(years)
    return jsonify([])

@app.route('/get_response', methods=['POST'])
def get_response():
    data = request.json  # Use request.json instead of request.form.get
    branch = data.get('branch')
    user_message = data.get('message')

    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    # Define the year order
    year_order = ['FY', 'SY', 'TY', 'BTech']
    courses_by_type = {'CP': {year: [] for year in year_order}, 'EL': {year: [] for year in year_order}}

    # Populate the courses_by_type dictionary with "CP" and "EL" courses
    if branch in work_program_dict:
        for year, data in work_program_dict[branch].items():
            if year in year_order:
                courses_by_type['CP'][year] = data.get('CP', [])
                courses_by_type['EL'][year] = data.get('EL', [])

    # Step 1: Send the prompt to the Gemini model to get the requirements list
    initial_prompt = f"User has typed in: '{user_message}'. What are the top 4 courses to achieve this? Provide the answer in a Python list format. Keep the requirements concise, to the point. Avoid sentences. Also, your output should only be the python list, nothing more, nothing less. Start your response with [ and end with ]. Each element in single quotes."
    
    # Start a chat session and send the prompt
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(initial_prompt)
    requirements_list = response.text.strip()
    print("Requirements List:", requirements_list)

    # Step 2: Find relevant courses for CP and EL
    relevant_courses = {'CP': {}, 'EL': {}}
    for category in ['CP', 'EL']:
        relevant_courses[category] = {}
        for year in year_order:
            course_prompt = (
                f"Given the following list of courses: {courses_by_type[category][year]}, "
                f"and the requirements: {requirements_list}, provide a list of relevant courses "
                f"for each requirement (mentioned in requirements list) from the provided course list only. "
                f"Nothing out of this course list. Be very strict with your course choices. "
                f"Only up to four very relevant courses from the list. Return the answer in Python list format. "
                f"Nothing more, nothing less. Your response should start with a [, and end with a ], with elements in between. "
                f"Each element should be in single quotes. Strictly only Python list. Not a list of lists. A single list of strings."
            )
            response = chat_session.send_message(course_prompt)
            relevant_courses[category][year] = eval(response.text.strip())
            print(f"Relevant {category} Courses for {year}:", relevant_courses[category][year])

    # Return the relevant courses as a JSON response
    return jsonify({'relevant_courses': relevant_courses})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
