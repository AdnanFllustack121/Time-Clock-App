import React, { useEffect, useRef, useState } from 'react'
import { Text, Button } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons';
import ManageAdminTable from './ManageAdminTable'
import { showToast } from '../Toast';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';
import moment from 'moment'

export default function ManageAdminsComponent() {
    const [allUsers, setAllUsers] = useState([])
    const [isLoadingTable, setLoadingTable] = useState(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 2
    const snap = useSnapshot(store)
    const [queryValue, setQueryValue] = useState('');
    const [actionID, setActionID] = useState('')

    useEffect(() => {
        // console.log('totalPages', totalPages);
        fetchAllUsers();
        // console.log('currentPage', currentPage);
    }, [currentPage, queryValue,]);


    const fetchAllUsers = async () => {
        console.log('hit fetchAllUsers');
        const query = queryValue.length > 0 ? queryValue : 'All'
        const queryParams = JSON.stringify(query)

        try {
            const response = await fetch(`/api/getAllUsers/${queryParams}/
          ${currentPage}/${itemsPerPage}`, {
                method: 'get',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const { message, data,
                    totalPages, hasNextPage, hasPrevPage
                } = await response.json()

                console.log('totalPages, hasNextPage, hasPrevPage', totalPages, hasNextPage, hasPrevPage);
                setAllUsers(data)
                setHasNextPage(hasNextPage)
                setHasPrevPage(hasPrevPage)
                setTotalPages(totalPages);
                setLoadingTable(false)

            }

        } catch (error) {
            console.log('error', error);
        }
    }

    const calculateItemNumber = (index) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
    };


    return (
        <>

            <div className='clockTableHeading' style={{ marginBottom: '0rem' }}>
                <Text variant="headingXl" as="h4">
                    <span className='headingTextColor'>All Users Table</span>
                </Text>
            </div>
            <div className='table-container'>

                <div className='card-table'>

                    <section style={{ display: 'block' }}>
                        <ManageAdminTable
                            allUsers={allUsers}
                            isLoadingTable={isLoadingTable}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            setQueryValue={setQueryValue}
                            queryValue={queryValue}
                            calculateItemNumber={calculateItemNumber}
                        />
                    </section>
                </div>

            </div>

        </>
    )
}
