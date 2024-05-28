import React from 'react'
import { Spinner } from '@shopify/polaris'


export default function Loader() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>
                <Spinner accessibilityLabel="Spinner example" size={"large"} />
            </div>
        </div>
    )
}
