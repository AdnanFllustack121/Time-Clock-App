import { Modal, TextField } from '@shopify/polaris';
import { useState, useCallback } from 'react';

export default function ModalComponent({ isTrue, toggleModal, handlePrimaryAction, primaryContent, secondaryContent, sectionContent, type, value, setValue }) {

    const handleChange = (val) => {
        setValue(val)
    }

    return (
        <Modal
            open={isTrue}
            onClose={toggleModal}
            title={type === "reason" ? sectionContent : "Confirmation"}
            primaryAction={{
                content: primaryContent,
                onAction: handlePrimaryAction,
            }}
            secondaryActions={[
                {
                    content: secondaryContent,
                    onAction: toggleModal,
                },
            ]}
        >
            <Modal.Section>

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
                    : sectionContent
                }
            </Modal.Section>
        </Modal>
    );
}