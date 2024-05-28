import React, { useState } from 'react'
import {
  IndexTable,
  Box, SkeletonBodyText, 
} from '@shopify/polaris';

export default function TodaysClockTable({ setFetchAgain }) {
  const [Data, setData] = useState([])

  const [isLoading, setIsLoading] = useState(true)


  const rowMarkup = Data?.map(
    ({ _id,
      campaignName,
      storeURL,
      selectedImage,
      previewSubject }, i) => (
      <IndexTable.Row
        id={_id}
        key={_id}
      >
        <IndexTable.Cell>
          <div style={{ whiteSpace: 'pre-wrap', width: '350px', fontWeight: '700' }}>
            {campaignName}
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>
              {selectedImage ? <img
                className='message-image'
                src={`/uploads/${storeURL}/${selectedImage}`}
                alt="Message Image"
                style={{
                  height: '45px', width: '45px', objectFit: 'cover',
                  borderRadius: '10%', marginRight: '10px'
                }}
              /> :
                <img
                  style={{
                    height: '45px', width: '45px', objectFit: 'cover',
                    borderRadius: '10%', marginRight: '10px', visibility: 'hidden'
                  }}
                />
              }
            </span>
            <div style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }}>
              {previewSubject}
            </div>
          </div>
        </IndexTable.Cell>

      </IndexTable.Row>
    )
  );

  return (
    <>
      <div className='table' style={{ marginBottom: '26px' }}>

        {isLoading ?
          <Box paddingBlockStart="200">
            <SkeletonBodyText
              lines={6}
            />
          </Box>
          :
          <IndexTable
            itemCount={Data.length}
            headings={[
              { title: 'Campaign Name' },
              { title: 'Preview Subject' },
              { title: 'Action' }

            ]}
            selectable={false}
          >
            {rowMarkup}
          </IndexTable>
        }
      </div>
    </>


  );
}