import React, { useEffect, useRef, useState } from 'react'
import { Text, Button } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons';
import LeaveRequestsTable from './LeaveRequestsTable';
import '../TimeClock/css/EmployeeClockInOut.css'
import { showToast } from '../Toast';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';
import ModalComponent from '../ModalComponent';
import moment from 'moment'

export default function LeaveRequestsComponent() {
    const [leaveRequestRecords, setLeaveRequestRecords] = useState([])
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
    const [confirmationModal, setConfirmationModal] = useState(false)
    const [actionID, setActionID] = useState('')
    const isInitialRender = useRef(true);

    useEffect(() => {
        const fetchOnlyFirstTime = async () => {
            setLoadingTable(true)
            await fetchLeaveRequestRecords()
            setLoadingTable(false)
        }
        fetchOnlyFirstTime()
    }, [])

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        // console.log('totalPages', totalPages);
        fetchLeaveRequestRecords();
        // console.log('currentPage', currentPage);
        // console.log('currentQueryPage', currentQueryPage);
    }, [currentPage, queryValue, currentQueryPage, dateFilter,]);


    const fetchLeaveRequestRecords = async () => {
        console.log('hit fetchLeaveRequestRecords');
        const query = {
            queryKeyword: queryValue.length > 0 ? queryValue : 'All',
            startDate: dateFilter.startDate ? moment(dateFilter.startDate).format('MMM DD, YYYY') : false,
            endDate: dateFilter.endDate ? moment(dateFilter.endDate).format('MMM DD, YYYY') : false
        }

        const page = queryValue.length > 0 ? currentQueryPage : currentPage

        try {
            const queryParams = JSON.stringify(query)
            console.log('queryParams from leaveRequestsComponent', queryParams);

            const response = await fetch(`/api/getAppliedLeave/${false}/${queryParams}/
          ${page}/${itemsPerPage}`, {
                method: 'get',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const { message, data, hasNextPageS, hasPrevPageS, totalItemsS, limit } = await response.json()
                setLeaveRequestRecords(data)
                setHasNextPage(hasNextPageS)
                setHasPrevPage(hasPrevPageS)
                // console.log('data from myleavecomponent', data);
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

    const toggleActionModal = (type) => {
        console.log('action type', type);
    }


    return (
        <>

            <div className='clockTableHeading' style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingXl" as="h4">
                    <span className='headingTextColor'>Employee Leaves requests</span>
                </Text>
            </div>
            <div className='table-container'>

                <div className='card-table'>

                    <section style={{ display: 'block' }}>
                        <LeaveRequestsTable
                            leaveRequestRecords={leaveRequestRecords}
                            isLoadingTable={isLoadingTable}
                            setCurrentPage={setCurrentPage}
                            setCurrentQueryPage={setCurrentQueryPage}
                            totalPages={totalPages}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            setQueryValue={setQueryValue}
                            queryValue={queryValue}
                            setDateFilter={setDateFilter}
                            dateFilter={dateFilter}
                            calculateItemNumber={calculateItemNumber}
                            toggleActionModal={toggleActionModal}
                        />
                    </section>
                </div>

            </div>

            <ModalComponent
                isTrue={confirmationModal}
                toggleModal={() => { }}
                handlePrimaryAction={() => { }}
                type={"delete"}
                primaryContent={"Delete"}
                secondaryContent={"Cancel"}
                sectionContent={'Are you sure you want to delete.'}
            />

        </>
    )
}