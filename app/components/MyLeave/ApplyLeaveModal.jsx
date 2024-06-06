import { Modal, TextField, Select, Form, FormLayout } from '@shopify/polaris';
import { useEffect } from 'react';

export default function ApplyLeaveModal({ isTrue, toggleModal, handlePrimaryAction, primaryContent, secondaryContent, value, setValue, type }) {

    const options = [
        { label: 'Festival', value: 'Festival' },
        { label: 'Casual', value: 'Casual' },
        { label: 'Sick', value: 'Sick' },
    ];

    const options2 = [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
    ];

    const handleChange = (_data, key) => {
        // console.log('value', _data);
        setValue((prev) => ({
            ...prev,
            [key]: _data,
            ...(key === 'leaveDuration' ? {
                leaveStartDate: '',
                leaveEndDate: ''
            } : {})
        }))
    }

    const handleReset = () => {
        setValue({
            leaveType: '',
            leaveReason: '',
            leaveDuration: '',
            leaveStartDate: '',
            leaveEndDate: '',
            leaveStatus: 'Pending'
        })
    }

    return (
        <Modal
            open={isTrue}
            onClose={() => {
                type === 'applyLeave' ? toggleModal() : toggleModal(null, 'edit')
            }}
            title={"Apply leave"}
            primaryAction={{
                content: primaryContent,
                onAction: handlePrimaryAction,
            }}
            secondaryActions={[
                {
                    content: 'Reset',
                    onAction: handleReset,

                },
                {
                    content: secondaryContent,
                    onAction: () => type === 'applyLeave' ? toggleModal() : toggleModal(null, 'edit'),
                },

            ]}

        >
            <Modal.Section>
                <Form >
                    <FormLayout>
                        <Select
                            label="Leave type:"
                            options={options}
                            onChange={_v => handleChange(_v, 'leaveType')}
                            value={value.leaveType}
                            placeholder="Select leave type"
                        />

                        <TextField
                            label="Reason:"
                            value={value.leaveReason}
                            onChange={(_v) => handleChange(_v, 'leaveReason')}
                            multiline={4}
                            autoComplete="off"
                            placeholder="Enter leave reason"
                        />

                        <Select
                            label="Duration:"
                            options={options2}
                            onChange={(_v) => handleChange(_v, 'leaveDuration')}
                            value={value.leaveDuration}
                            placeholder="Select leave duration"
                        />

                        <TextField
                            label={value.leaveDuration === 'multiple' ? "Start date:" : "Date:"}
                            value={value.leaveStartDate}
                            onChange={(_v) => handleChange(_v, 'leaveStartDate')}
                            type='date'
                            autoComplete="off"
                            placeholder={value.leaveDuration === 'multiple' ? "Select start date" : "Select date"}
                        />

                        {value.leaveDuration === 'multiple' &&
                            <TextField
                                label="End date:"
                                value={value.leaveEndDate}
                                onChange={(_v) => handleChange(_v, 'leaveEndDate')}
                                type='date'
                                autoComplete="off"
                                placeholder="Select end date"
                            />}
                    </FormLayout>
                </Form>
            </Modal.Section>
        </Modal>
    );
}
