import React, { useEffect, useRef, useState } from 'react'
import { Text, Button } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons';
import MyLeaveTable from './MyLeaveTable'
import '../TimeClock/css/EmployeeClockInOut.css'
import ApplyLeaveModal from './ApplyLeaveModal';
import { showToast } from '../Toast';
import { useSnapshot } from 'valtio';
import { store } from '../../valtio/store';
import ModalComponent from '../ModalComponent';
import moment from 'moment'

export default function MyLeaveComponent() {
  const [myLeaveRecords, setMyLeaveRecords] = useState([])
  const [isLoadingTable, setLoadingTable] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQueryPage, setCurrentQueryPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6
  const snap = useSnapshot(store)
  const [queryValue, setQueryValue] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })
  const [leaveModal, setLeaveModal] = useState({
    isOpen: false,
    type: '',
  })
  const [formValues, setFormValues] = useState({
    leaveType: '',
    leaveReason: '',
    leaveDuration: '',
    leaveStartDate: '',
    leaveEndDate: '',
    leaveStatus: 'Pending'
  })
  const [confirmationModal, setConfirmationModal] = useState(false)
  const [actionID, setActionID] = useState('')
  const isInitialRender = useRef(true);

  useEffect(() => {
    const fetchOnlyFirstTime = async () => {
      setLoadingTable(true)
      await fetchMyLeaveRecords()
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
    fetchMyLeaveRecords();
    // console.log('currentPage', currentPage);
    // console.log('currentQueryPage', currentQueryPage);
  }, [currentPage, queryValue, currentQueryPage, dateFilter,]);


  const fetchMyLeaveRecords = async () => {
    // console.log('hit fetchMyLeaveRecords');
    const query = {
      queryReason: queryValue.length > 0 ? queryValue : 'All',
      startDate: dateFilter.startDate ? moment(dateFilter.startDate).format('MMM DD, YYYY') : false,
      endDate: dateFilter.endDate ? moment(dateFilter.endDate).format('MMM DD, YYYY') : false
    }

    const page = queryValue.length > 0 ? currentQueryPage : currentPage

    try {
      const queryParams = JSON.stringify(query)
      // console.log('queryParams', queryParams);

      const response = await fetch(`/api/getAppliedLeave/${snap.user.email}/${queryParams}/
          ${page}/${itemsPerPage}`, {
        method: 'get',
        headers: {
          "Content-Type": "application/json",
        }
      })

      if (response.ok) {
        const { message, data, hasNextPageS, hasPrevPageS, totalItemsS, limit } = await response.json()
        setMyLeaveRecords(data)
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

  const toggleLeaveModal = () => {
    // console.log('hit toggleLeaveModal');
    setLeaveModal((prev) => ({
      isOpen: !prev.isOpen,
      type: prev.isOpen ? '' : 'applyLeave',
    }))
  }

  const handleApplyLeave = async () => {
    // form validation
    if (!formValues.leaveType) return showToast('Leave type is required');
    if (!formValues.leaveReason) return showToast('Reason is required');
    if (!formValues.leaveDuration) return showToast('Duration is required');
    if (formValues.leaveDuration === 'multiple') {
      if (!formValues.leaveStartDate && !formValues.leaveEndDate) return showToast('Start date and end date are required');
      if (!formValues.leaveStartDate) return showToast('Start date is required');
      if (!formValues.leaveEndDate) return showToast('End date is required');
      if (formValues.leaveStartDate === formValues.leaveEndDate) return showToast("Start date and end date cannot be the same.");
      if (formValues.leaveStartDate > formValues.leaveEndDate) return showToast("Start date cannot be greater than the end date.");
    } else if (!formValues.leaveStartDate) return showToast('Date is required');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const apiData = {
      ...formValues,
      createdAt: new Date(),
      createdBy: snap.user.email,
      employeeName: `${snap.user.firstName} ${snap.user.lastName}`,
      userTimezone
    }

    try {

      const response = await fetch('/api/applyLeave', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, data } = await response.json()
        // console.log('data from apply leave response', data);
        showToast(message)
        setFormValues({
          leaveType: '',
          leaveReason: '',
          leaveDuration: '',
          leaveStartDate: '',
          leaveEndDate: '',
          leaveStatus: 'Pending'
        })
      }

    } catch (error) {
      console.log('error while applying leave!', error);
    } finally {
      toggleLeaveModal()
      fetchMyLeaveRecords()
    }

  };

  const toggleActionModal = (id, type) => {
    // console.log('hit toggleActionModal', id, '  ', type);
    if (id) {
      setActionID(id)
    }
    if (type === 'edit') {
      if (id) {
        const dataToUpdate = myLeaveRecords.filter(_d => _d._id === id)[0]
        // console.log('dataToUpdata:', dataToUpdate);
        setFormValues({
          leaveType: dataToUpdate.type,
          leaveReason: dataToUpdate.reason,
          leaveDuration: dataToUpdate.duration,
          leaveStartDate: dataToUpdate.startDate,
          leaveEndDate: dataToUpdate.endDate,
          leaveStatus: 'Pending'
        })
      } else {
        setFormValues({
          leaveType: '',
          leaveReason: '',
          leaveDuration: '',
          leaveStartDate: '',
          leaveEndDate: '',
          leaveStatus: 'Pending'
        })
      }
      // console.log('leaveModal', leaveModal);
      setLeaveModal((prev) => {
        return ({
          type: prev.isOpen ? '' : 'edit',
          isOpen: !prev.isOpen,

        })
      })

    } else {
      setConfirmationModal(prev => !prev)

    }
  }

  const handleDeleteLeave = async () => {
    // console.log('hit delete leave! id of delete', actionID);
    try {
      const apiData = {
        type: 'delete',
        actionID
      }
      const response = await fetch('/api/leaveAction', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, data } = await response.json()
        showToast(message)
        // console.log('data from handleDeleteLeave', data)
        // setMyLeaveRecords(prev => {
        //   return prev.filter(_d => _d._id !== data._id)
        // })
        fetchMyLeaveRecords()
      }
    } catch (error) {
      console.log('error while deleting leave!', error);
    } finally {
      setActionID('')
      toggleActionModal(null, 'delete')
    }

  }

  const handleEditLeave = async () => {
    // console.log('hit edit leave! formValues:', formValues);

    try {
      const apiData = {
        ...formValues,
        type: 'edit',
        actionID
      }
      const response = await fetch('/api/leaveAction', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        const { message, data } = await response.json()
        showToast(message)
        // console.log('data from handleEditLeave', data);
        fetchMyLeaveRecords()
        // setMyLeaveRecords(prev => {
        //   return prev.map(_d => {
        //     if (_d._id === data._id) {
        //       return data
        //     }
        //     return _d
        //   })
        // })
      }
    } catch (error) {
      console.log('error while editing leave!', error);
    } finally {
      setActionID('')
      toggleActionModal(null, 'edit')
    }

  }

  const calculateItemNumber = (index) => {
    return (queryValue.length > 0 ? currentQueryPage - 1 : currentPage - 1) * itemsPerPage + index + 1;
  };


  return (
    <>

      <div className='clockTableHeading' style={{ marginBottom: '0rem' }}>
        <Text variant="headingXl" as="h4">
          <span className='headingTextColor'>Applied Leave request records</span>
        </Text>
      </div>
      <div className="apply_button">
        <Button variant="primary" onClick={toggleLeaveModal} icon={PlusIcon}>Apply leave</Button>
      </div>
      <div className='table-container'>

        <div className='card-table'>

          <section style={{ display: 'block' }}>
            <MyLeaveTable
              myLeaveRecords={myLeaveRecords}
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
              toggleActionModal={toggleActionModal}
              calculateItemNumber={calculateItemNumber}
            />
          </section>
        </div>

      </div>

      <ApplyLeaveModal
        isTrue={leaveModal.isOpen}
        toggleModal={leaveModal.type === 'applyLeave' ? toggleLeaveModal : toggleActionModal}
        handlePrimaryAction={leaveModal.type === 'applyLeave' ? handleApplyLeave : handleEditLeave}
        type={leaveModal.type}
        primaryContent={"Save"}
        secondaryContent={"Cancel"}
        value={formValues}
        setValue={setFormValues}
      />

      <ModalComponent
        isTrue={confirmationModal}
        toggleModal={toggleActionModal}
        handlePrimaryAction={handleDeleteLeave}
        type={"delete"}
        primaryContent={"Delete"}
        secondaryContent={"Cancel"}
        sectionContent={'Are you sure you want to delete.'}
      />

    </>
  )
}
