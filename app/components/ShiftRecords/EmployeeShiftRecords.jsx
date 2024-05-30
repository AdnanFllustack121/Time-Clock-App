import React, { useEffect, useState } from 'react'
import { Text } from '@shopify/polaris'
import EmployeesClockTable from './EmployeesClockTable'
import '../TimeClock/css/EmployeeClockInOut.css'


export default function EmployeeShiftRecords() {
    const [shiftRecords, setShiftRecords] = useState([])
    const [isLoadingTable, setLoadingTable] = useState([])

    useEffect(() => {
        const fetchShiftRecords = async () => {
            setLoadingTable(true)
            try {

                const response = await fetch(`/api/getAttendance/${false}/${false}`, {
                    method: 'get',
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                if (response.ok) {
                    const { message, attendanceData } = await response.json()
                    setShiftRecords(attendanceData)

                }

            } catch (error) {
                console.log('error', error);
            } finally {
                setLoadingTable(false)
            }
        }
        fetchShiftRecords()
    }, [])


    return (
        <>

            <div className='clockTableHeading'>
                <Text variant="headingXl" as="h4">
                    Employees shift records
                </Text>
            </div>

            <div className='table-container'>

                <div className='card-table'>
                    <section>
                        <EmployeesClockTable
                            shiftRecords={shiftRecords}
                            isLoadingTable={isLoadingTable}
                        />
                    </section>
                </div>
            </div>

        </>
    )
}
