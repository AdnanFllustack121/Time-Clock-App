import { Modal, Text } from '@shopify/polaris';

export default function ManageAdminsModal({
    isTrue,
    type,
    primaryContent,
    secondaryContent,
    toggleModal,
    getActiveUser, handleManageAdminStatus }) {

    return (
        <Modal
            open={isTrue}
            onClose={toggleModal}
            title={type === 'assignAdmin' ? "Assign Admin" : "Revoke Admin"}
            primaryAction={{
                content: primaryContent,
                onAction: () => handleManageAdminStatus(type, getActiveUser.id),
            }}
            secondaryActions={[
                {
                    content: secondaryContent,
                    onAction: toggleModal
                },
            ]}

        >
            <Modal.Section>
                <Text variant="bodyMd" as="p">
                    Are you sure you want to {type === 'assignAdmin' ? "assign admin to " : "revoke admin from "}
                    {`${getActiveUser?.firstName} ${getActiveUser?.lastName}(${getActiveUser?.email})?`}
                </Text>
            </Modal.Section>
        </Modal>
    );
}
