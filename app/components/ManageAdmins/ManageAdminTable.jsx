import React, { useCallback, useEffect, useState } from 'react';
import {
    IndexTable,
    Box,
    SkeletonBodyText,
    Icon,
    useSetIndexFiltersMode, IndexFilters, TextField, Text, ButtonGroup, Button, Tooltip
} from '@shopify/polaris';
import './ManageAdminTable.css'


export default function ManageAdminTable({ allUsers,
    isLoadingTable,
    setCurrentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setQueryValue,
    queryValue, calculateItemNumber }) {

    const { mode, setMode } = useSetIndexFiltersMode();


    const rowMarkup =
        allUsers.length <= 0 ? [] : allUsers?.map(({ _id, firstName, lastName, isAdmin, email, contact }, i) => {

            return (
                <IndexTable.Row key={_id}>
                    <IndexTable.Cell><Text variant="bodyMd" fontWeight="bold">{calculateItemNumber(i)}</Text></IndexTable.Cell>
                    <IndexTable.Cell>{firstName}</IndexTable.Cell>
                    <IndexTable.Cell>{lastName}</IndexTable.Cell>
                    <IndexTable.Cell>{email}</IndexTable.Cell>
                    <IndexTable.Cell>{contact}</IndexTable.Cell>
                    <IndexTable.Cell>{isAdmin ? <p style={{ color: 'rgb(80, 148, 95)' }}>Yes</p> : <p style={{ color: 'rgb(238, 78, 78)' }}>No</p>}</IndexTable.Cell>
                    <IndexTable.Cell>
                        <div className='adminAction'>
                            {isAdmin ? <Button tone='critical'>Revoke Admin</Button> : <Button>Assign Admin</Button>}
                        </div>
                    </IndexTable.Cell>
                </IndexTable.Row>
            )
        });

    return (
        <div className='table' style={{
            // marginBottom: '26px'
        }}>
            {isLoadingTable ?
                <Box paddingBlockStart="200">
                    <SkeletonBodyText lines={10} />
                </Box>
                :
                <>
                    <IndexFilters
                        queryValue={queryValue}
                        queryPlaceholder="Searching in reason"
                        onQueryChange={(_d) => setQueryValue(_d)}
                        cancelAction={{
                            onAction: () => { setCurrentPage(1) },
                            disabled: false,
                            loading: false,
                        }}
                        onQueryClear={() => {
                            setQueryValue('')
                        }}
                        tabs={[]}
                        filters={[]}
                        canCreateNewView={false}
                        mode={mode}
                        setMode={setMode}
                    />
                    <IndexTable
                        itemCount={allUsers?.length ?? 0}
                        headings={[
                            { title: 'No.' },
                            { title: 'First Name' },
                            { title: 'Last Name' },
                            { title: 'Email' },
                            { title: 'Contact' },
                            { title: 'Is Admin' },
                            { title: 'Action' },
                        ]}
                        selectable={false}
                        pagination={{
                            hasNext: hasNextPage,
                            hasPrevious: hasPrevPage,
                            onNext: () => {
                                setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
                            },
                            onPrevious: () => {
                                setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
                            },
                        }}
                    >
                        {rowMarkup}
                    </IndexTable>
                </>

            }
        </div>
    );

}
