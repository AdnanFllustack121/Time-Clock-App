import React, { useEffect, useRef, useState } from 'react'
import { Text } from '@shopify/polaris'
import EmployeesClockTable from './EmployeesClockTable'
import TestComponent from '../TestComponent'
import '../TimeClock/css/EmployeeClockInOut.css'
import moment from 'moment'


export default function EmployeeShiftRecords() {
    const [shiftRecords, setShiftRecords] = useState([])
    const [isLoadingTable, setLoadingTable] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [currentQueryPage, setCurrentQueryPage] = useState(1)
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6
    const [queryValue, setQueryValue] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    })

    const isInitialRender = useRef(true);


    useEffect(() => {
        const fetchOnlyFirstTime = async () => {
            setLoadingTable(true)
            await fetchShiftRecords()
            setLoadingTable(false)
        }
        fetchOnlyFirstTime()
    }, [])

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        console.log('totalPages', totalPages);
        // if (queryValue.length > 0 && queryValue.length < 2 ) setCurrentQueryPage(1)
        // if (queryValue.length < 1 && queryValue.length < 1) setCurrentPage(1)

        fetchShiftRecords();
        console.log('currentPage', currentPage);
        console.log('currentQueryPage', currentQueryPage);
    }, [currentPage, queryValue, currentQueryPage, dateFilter,]);


    const fetchShiftRecords = async () => {
        // console.log('hit fetchShiftRecords');
        const query = {
            queryName: queryValue.length > 0 ? queryValue : 'All',
            startDate: dateFilter.startDate ? moment(dateFilter.startDate).format('MMM DD, YYYY') : false,
            endDate: dateFilter.endDate ? moment(dateFilter.endDate).format('MMM DD, YYYY') : false
        }

        const page = queryValue.length > 0 ? currentQueryPage : currentPage

        try {
            const queryParams = JSON.stringify(query)
            console.log('queryParams', queryParams);

            const response = await fetch(`/api/getAttendance/${false}/${false}/${queryParams}/
            ${page}/${itemsPerPage}`, {
                method: 'get',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const { message, attendanceData, hasNextPageS, hasPrevPageS, totalItemsS, limit } = await response.json()
                setShiftRecords(attendanceData)
                setHasNextPage(hasNextPageS)
                setHasPrevPage(hasPrevPageS)
                // console.log('Math.ceil(totalItemsS / limit)', Math.ceil(totalItemsS / limit));
                setTotalPages(Math.ceil(totalItemsS / limit));

            }

        } catch (error) {
            console.log('error', error);
        }
    }

    const calculateItemNumber = (index) => {
        return (queryValue.length > 0 ? currentQueryPage - 1 : currentPage - 1) * itemsPerPage + index + 1;
    };


    return (
        <>

            <div className='clockTableHeading'>
                <Text variant="headingXl" as="h4">
                    Employees shift records
                </Text>
            </div>

            <div className='table-container'>

                <div className='card-table'>
                    <section style={{ display: 'block' }}>
                        <EmployeesClockTable
                            shiftRecords={shiftRecords}
                            isLoadingTable={isLoadingTable}
                            setCurrentPage={setCurrentPage}
                            setCurrentQueryPage={setCurrentQueryPage}
                            totalPages={totalPages}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            calculateItemNumber={calculateItemNumber}
                            setQueryValue={setQueryValue}
                            queryValue={queryValue}
                            setDateFilter={setDateFilter}
                            dateFilter={dateFilter}
                        />
                    </section>
                </div>

            </div>




        </>
    )
}
