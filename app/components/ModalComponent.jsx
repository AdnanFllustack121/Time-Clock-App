import { Modal, TextField, FormLayout } from '@shopify/polaris';
import { useState, useCallback } from 'react';

export default function ModalComponent({ isTrue, toggleModal, handlePrimaryAction, primaryContent, secondaryContent, sectionContent,
    type, value, setValue, handleAdminInputChange, isLoadingButton = false }) {

    const handleChange = (val) => {
        setValue(val)
    }

    return (
        <Modal
            open={isTrue}
            onClose={toggleModal}
            title={
                type === "reason" ? sectionContent :
                type === "adminClockOut" ? 'Please fill all the fields correctly.' :
                type == "adminEdit" ? "Update Shift Timings" :
                type == "viewProfile" ? "User Details" :
                "Confirmation"
            }
            primaryAction={{
                content: primaryContent,
                onAction: handlePrimaryAction,
                destructive: type === 'delete' ? true : false,
                loading: isLoadingButton
            }}
            secondaryActions={
                type != "viewProfile" && [{
                    content: secondaryContent,
                    onAction: toggleModal,
                }]
            }
        >
            <Modal.Section>
                {type === "adminClockOut" &&
                    <>
                        <FormLayout>
                            <FormLayout.Group condensed>
                                <TextField
                                    label="Select a date and time:"
                                    value={value.out_time}
                                    onChange={(_v) => handleAdminInputChange(_v, 'out_time')}
                                    type='datetime-local'
                                    autoComplete="off"
                                />
                                <input style={{ visibility: 'hidden' }} />
                                <input style={{ visibility: 'hidden' }} />
                            </FormLayout.Group>
                        </FormLayout>

                        <div style={{ marginTop: '10px' }} />

                        <TextField
                            label="Note:"
                            value={value.note}
                            onChange={(_v) => handleAdminInputChange(_v, 'note')}
                            multiline={4}
                            autoComplete="off"
                        />
                    </>
                }
                {type === "adminEdit" &&
                    <>
                        <FormLayout>
                            {
                                value?.in_datetime != null && <FormLayout.Group condensed>
                                    <TextField
                                        label="Select In Date and Time:"
                                        value={value?.in_datetime}
                                        onChange={(_v) => handleAdminInputChange(_v, 'in_datetime')}
                                        type='datetime-local'
                                        autoComplete="off"
                                    />
                                    <input style={{ visibility: 'hidden' }} />
                                    <input style={{ visibility: 'hidden' }} />
                                </FormLayout.Group>
                            }
                            {
                                value?.out_datetime != null && <FormLayout.Group condensed>
                                    <TextField
                                        label="Select Out Date and Time:"
                                        value={value?.out_datetime}
                                        onChange={(_v) => handleAdminInputChange(_v, 'out_datetime')}
                                        type='datetime-local'
                                        autoComplete="off"
                                    />
                                    <input style={{ visibility: 'hidden' }} />
                                    <input style={{ visibility: 'hidden' }} />
                                </FormLayout.Group>
                            }
                        </FormLayout>
                    </>
                }

                {type === "reason" ?
                    <>
                        <TextField
                            label="Note:"
                            value={value}
                            onChange={handleChange}
                            multiline={4}
                            autoComplete="off"
                        />
                    </>
                    : type === "adminClockOut" ? '' : sectionContent
                }
                {
                    type === "viewProfile" &&
                    <>
                        <FormLayout>
                            <FormLayout.Group condensed>
                                <TextField
                                    value={value?.firstName}
                                    label="First Name"
                                    type='text'
                                    autoComplete="off"
                                    readOnly
                                />
                                <TextField
                                    value={value?.lastName}
                                    label="Last Name"
                                    type='text'
                                    autoComplete="off"
                                    readOnly
                                />
                            </FormLayout.Group>
                            <FormLayout.Group condensed>
                                <TextField
                                    value={value?.email}
                                    label="Email"
                                    type='email'
                                    autoComplete="off"
                                    readOnly
                                />
                                <TextField
                                    value={value?.contact}
                                    label="Contact Number"
                                    type='number'
                                    autoComplete="off"
                                    readOnly
                                />
                            </FormLayout.Group>
                            <FormLayout.Group condensed>
                                <TextField
                                    value={
                                        value?.isSuperAdmin == true ? "Super Admin" :
                                        value?.isAdmin == true ? "Admin" :
                                        value?.isAdmin == false ? "Employee" :
                                        "User"
                                    }
                                    label="Role"
                                    type='text'
                                    autoComplete="off"
                                    readOnly
                                />
                                <div></div>
                            </FormLayout.Group>
                        </FormLayout>
                    </>
                }
            </Modal.Section>
        </Modal>
    );
}