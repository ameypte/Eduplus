"use client";
import SideBar from '@/components/SideBar'
import { useState, useEffect } from 'react'
import { ImSpinner } from "react-icons/im";


export default function Course() {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState(null);
    const [error, setError] = useState(null);

    // for testing purposes
    const [response, setResponse] = useState({
        "relevant_courses": {
            "CP": {
                "BTech": [],
                "FY": [
                    "Quantitative Techniques",
                    "Discrete Structures",
                    "C++ AND CORE JAVA PROGRAMMING",
                    "DATABASE MANAGEMENT SYSTEM "
                ],
                "SY": [
                    "DATA SCIENCE",
                    "DATA WAREHOUSING AND DATA MINING",
                    "COMPUTER ORIENTED NUMERICAL METHODS",
                    "DATABASE MANAGEMENT SYSTEMS"
                ],
                "TY": [
                    "DATA SCIENCE",
                    "DEEP LEARNING"
                ]
            },
            "EL": {
                "BTech": [],
                "FY": [
                    "ADVANCED DBMS"
                ],
                "SY": [],
                "TY": [
                    "ARTIFICIAL INTELLIGENCE"
                ]
            }
        }
    });

    useEffect(() => {
        // get departments from the API: http://127.0.0.1:5001/get_branches
        fetch('http://127.0.0.1:5001/get_branches')
            .then(response => response.json())
            .then(data => {
                setDepartments(data.branches);
            })
            .catch(error => {
                setError(error);
            });
    }, []);

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);

        // get years from the API(post): http://127.0.0.1:5001/get_years

        fetch('http://127.0.0.1:5001/get_years', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ branch: e.target.value })
        })
            .then(response => response.json())
            .then(data => {
                setYears(data);
            })
            .catch(error => {
                setError(error);
            });
    }



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // get recommendations from the API(post): http://127.0.0.1:5001/get_response

        fetch('http://127.0.0.1:5001/get_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                branch: selectedDepartment,
                year: selectedYear,
                message: selectedInterests
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setResponse(data.relevant_courses);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
            }).finally(() => {
                setLoading(false);
            });
    }

    return (
        <SideBar>
            <div className='bg-white dark:bg-gray-800 dark:text-gray-100 p-5 rounded-md'>
                <h1 className='text-2xl font-semibold mb-3 text-gray-500 dark:text-gray-200'>Course Recommendations</h1>
                <p className='text-base text-gray-500 dark:text-gray-400'>Based on your interests, here are some courses you might like:</p>

                <form className="mx-auto mt-5" method='POST'>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="mb-5">
                            <label for="dept" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Department</label>
                            <select id="dept" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={handleDepartmentChange}>
                                <option selected>Choose a department</option>
                                {departments.map((dept) => (
                                    <option value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-5">
                            <label for="year" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an Year</label>
                            <select id="year" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => setSelectedYear(e.target.value)} disabled={!selectedDepartment}>
                                <option selected>Choose a year</option>
                                {years.map((year) => (
                                    <option value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-5">
                        <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Describe your interests</label>
                        <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."
                            onChange={(e) => setSelectedInterests(e.target.value)}
                        ></textarea>
                    </div>
                    <button type="button" class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-full"
                        onClick={handleSubmit} disabled={loading}
                    >
                        {loading ? <><ImSpinner className="animate-spin inline-block me-3" />
                            Generating...
                        </> : 'Generate Recommendations'}
                    </button>
                </form>

                {response && (<>
                    <h2 className='text-xl font-semibold mt-5 mb-4 text-gray-500 dark:text-gray-200'>Compalsory Courses</h2>

                    <ol class="items-center sm:flex">
                        <li class="relative mb-6 sm:mb-0">
                            <div class="flex items-center">
                                <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                                    <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                            </div>
                            <div class="mt-3 sm:pe-8">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">FY</h3>
                                <p class="text-base font-normal text-gray-500 dark:text-gray-400">
                                    <ol>
                                        <li>
                                            Quantitative Techniques
                                        </li>
                                        <li>
                                            Discrete Structures
                                        </li>
                                        <li>
                                            C++ AND CORE JAVA PROGRAMMING
                                        </li>
                                    </ol>
                                </p>
                            </div>
                        </li>
                        <li class="relative mb-6 sm:mb-0">
                            <div class="flex items-center">
                                <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                                    <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                            </div>
                            <div class="mt-3 sm:pe-8">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">FY</h3>
                                <p class="text-base font-normal text-gray-500 dark:text-gray-400">
                                    <ol>
                                        <li>
                                            Quantitative Techniques
                                        </li>
                                        <li>
                                            Discrete Structures
                                        </li>
                                        <li>
                                            C++ AND CORE JAVA PROGRAMMING
                                        </li>
                                    </ol>
                                </p>
                            </div>
                        </li>
                    </ol>

                    <h2 className='text-xl font-semibold mt-5 mb-4 text-gray-500 dark:text-gray-200'>Elective Courses</h2>
                    <ol class="items-center sm:flex">
                        <li class="relative mb-6 sm:mb-0">
                            <div class="flex items-center">
                                <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                                    <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                            </div>
                            <div class="mt-3 sm:pe-8">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">FY</h3>
                                <p class="text-base font-normal text-gray-500 dark:text-gray-400">
                                    <ol>
                                        <li>
                                            Quantitative Techniques
                                        </li>
                                        <li>
                                            Discrete Structures
                                        </li>
                                        <li>
                                            C++ AND CORE JAVA PROGRAMMING
                                        </li>
                                    </ol>
                                </p>
                            </div>
                        </li>
                        <li class="relative mb-6 sm:mb-0">
                            <div class="flex items-center">
                                <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                                    <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                                    </svg>
                                </div>
                                <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
                            </div>
                            <div class="mt-3 sm:pe-8">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">FY</h3>
                                <p class="text-base font-normal text-gray-500 dark:text-gray-400">
                                    <ol>
                                        <li>
                                            Quantitative Techniques
                                        </li>
                                        <li>
                                            Discrete Structures
                                        </li>
                                        <li>
                                            C++ AND CORE JAVA PROGRAMMING
                                        </li>
                                    </ol>
                                </p>
                            </div>
                        </li>
                    </ol>

                </>)}

            </div>
        </SideBar>
    )
}
