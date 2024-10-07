<template>
  <div class="container">
    <h1 class="main-title">Course Selection Demo</h1>

    <div class="form-section">
      <h2>Find Courses By Program, Year and Aspiration</h2>
      <div class="form-group">
        <label for="program" class="form-label">Select Program:</label>
        <select id="program" class="form-select" v-model="selectedProgram" @change="onProgramChange">
          <option value="" disabled>Select a program</option>
          <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
        </select>
      </div>

      <div class="form-group" v-if="years.length > 0">
        <label for="year" class="form-label">Select Year:</label>
        <select id="year" class="form-select" v-model="selectedYear" @change="onYearChange">
          <option value="" disabled>Select a year</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div class="form-group" v-if="jobs.length > 0">
        <label for="job" class="form-label">Select Job:</label>
        <select id="job" class="form-select" v-model="selectedJob" @change="fetchCommonCourses">
          <option value="" disabled>Select a job</option>
          <option v-for="job in jobs" :key="job" :value="job">{{ job }}</option>
        </select>
      </div>

      <div v-if="commonCourses.length > 0" class="result-section">
        <h3>Available Courses:</h3>
        <ul class="course-list">
          <li v-for="course in commonCourses" :key="course['course name']">
            {{ course['course name'] }} - Semester {{ course.sem }}
          </li>
        </ul>
      </div>

      <div v-if="isLoading" class="loading">Loading...</div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>

    <hr class="separator" />

    <div class="form-section">
      <h2>Get Courses by Program and Aspiration</h2>
      <div class="form-group">
        <label for="program2" class="form-label">Select Program:</label>
        <select id="program2" class="form-select" v-model="selectedProgramForJob" @change="onProgramForJobChange">
          <option value="" disabled>Select a program</option>
          <option v-for="program in programs" :key="program + '-2'" :value="program">{{ program }}</option>
        </select>
      </div>

      <div class="form-group" v-if="jobsForProgram.length > 0">
        <label for="job2" class="form-label">Select Job:</label>
        <select id="job2" class="form-select" v-model="selectedJobForProgram" @change="fetchCoursesForProgramAndJob">
          <option value="" disabled>Select a job</option>
          <option v-for="job in jobsForProgram" :key="job + '-2'" :value="job">{{ job }}</option>
        </select>
      </div>

      <div v-if="coursesForProgramAndJob.length > 0" class="result-section">
        <h3>Course Information:</h3>
        <table class="course-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Semester</th>
              <th>Course Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in coursesForProgramAndJob" :key="course['course name']">
              <td>{{ course.year }}</td>
              <td>{{ course.sem }}</td>
              <td>{{ course['course name'] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isLoadingSecond" class="loading">Loading...</div>

      <div v-if="errorMessageSecond" class="error-message">{{ errorMessageSecond }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      programs: [],
      years: [],
      jobs: [],
      selectedProgram: '',
      selectedYear: '',
      selectedJob: '',
      commonCourses: [],
      errorMessage: '',
      isLoading: false,

      selectedProgramForJob: '',
      jobsForProgram: [],
      selectedJobForProgram: '',
      coursesForProgramAndJob: [],
      errorMessageSecond: '',
      isLoadingSecond: false
    };
  },
  methods: {
    async fetchPrograms() {
      this.isLoading = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/api/programs');
        if (!response.ok) throw new Error('Failed to fetch programs');
        this.programs = await response.json();
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchYears() {
      this.isLoading = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/api/years');
        if (!response.ok) throw new Error('Failed to fetch years');
        this.years = await response.json();
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchJobs() {
      this.isLoading = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        this.jobs = await response.json();
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCommonCourses() {
      this.errorMessage = "";
      if (this.selectedProgram && this.selectedYear && this.selectedJob) {
        this.isLoading = true;
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/common_courses?program=${this.selectedProgram}&year=${this.selectedYear}&job=${this.selectedJob}`);
          if (!response.ok) throw new Error('No relevant courses available');
          this.commonCourses = await response.json();
        } catch (error) {
          this.errorMessage = error.message;
        } finally {
          this.isLoading = false;
        }
      }
    },
    async fetchJobsForProgram() {
      this.isLoadingSecond = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        this.jobsForProgram = await response.json();
      } catch (error) {
        this.errorMessageSecond = error.message;
      } finally {
        this.isLoadingSecond = false;
      }
    },
    async fetchCoursesForProgramAndJob() {
      this.errorMessageSecond = ""; // Clear error message on new selection
      if (this.selectedProgramForJob && this.selectedJobForProgram) {
        this.isLoadingSecond = true;
        try {
          const response = await fetch(`http://127.0.0.1:5000/api/courses_by_program_and_job?program=${this.selectedProgramForJob}&job=${this.selectedJobForProgram}`);
          if (!response.ok) throw new Error('No relevant courses available');
          this.coursesForProgramAndJob = await response.json();
        } catch (error) {
          this.errorMessageSecond = error.message;
        } finally {
          this.isLoadingSecond = false;
        }
      }
    },
    onProgramChange() {
      this.errorMessage = "";
      this.selectedYear = '';
      this.years = [];
      this.fetchYears();
    },
    onYearChange() {
      this.errorMessage = "";
      this.selectedJob = '';
      this.jobs = [];
      this.fetchJobs();
    },
    onProgramForJobChange() {
      this.errorMessageSecond = "";
      this.selectedJobForProgram = '';
      this.jobsForProgram = [];
      this.fetchJobsForProgram();
    }
  },
  created() {
    this.fetchPrograms();
  }
};
</script>

<style scoped>
.container {
  width: 50%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.main-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.form-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.separator {
  margin: 40px 0;
  border: 0;
  border-top: 2px solid #ddd;
}

.loading {
  font-weight: bold;
  color: #007bff;
}

.error-message {
  color: red;
  margin-top: 20px;
}

.result-section {
  margin-top: 20px;
}

.course-list {
  list-style-type: none;
  padding: 0;
}

.course-list li {
  padding: 8px;
  background: #eef;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 5px;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
}

.course-table th,
.course-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.course-table th {
  background-color: #f4f4f4;
}
</style>
