import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import LeaveModal from "../MONGODB/LeaveModal.";


export const loader = async ({ params, request }) => {
    // console.log('params from getLeavesData', params);
    // console.log('new date', new Date(params.todaysDate));

    const query = JSON.parse(params.query)
    const limit = params.limit
    const page = params.page

    // console.log('limit from getLeavesData', limit)
    // console.log('page from getLeavesData', page);
    // console.log('query from getLeavesData', query)

    try {
        const { admin, session } = await authenticate.admin(request);

        let leaveRequestRecords;
        let totalItems;
        let totalPages;
        let hasNextPage;
        let hasPrevPage

        const queryRegex = new RegExp(query.queryReason.replace(/\s+/g, '\\s*'), 'i');

        const matchStage = (query.queryReason !== 'All') ? {
            storeURL: session.shop,
            createdBy: params.email,
            reason: {
                $regex: queryRegex
            }
        } : {
            storeURL: session.shop,
            createdBy: params.email,
        };

        const dateFilter = {};
        if (query.startDate) {
            dateFilter.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            dateFilter.$lte = new Date(query.endDate);
        }

        // console.log('dateFilter......', dateFilter);

        const basePipeline = [
            { $match: matchStage }
        ];

        if (Object.keys(dateFilter).length > 0) {
            basePipeline.push({
                $match: { "createdAt": dateFilter }
            });
        }

        basePipeline.push({
            $sort: { "createdAt": -1 }
        })

        const countPipeline = [
            ...basePipeline,
            { $count: "totalItems" }
        ];

        const resultFromCount = await LeaveModal.aggregate(countPipeline);
        totalItems = resultFromCount.length > 0 ? resultFromCount[0].totalItems : 0;
        totalPages = Math.ceil(totalItems / limit);
        hasNextPage = page < totalPages;
        hasPrevPage = page > 1;

        if (!query.startDate && !query.endDate) {
            basePipeline.push(
                { $skip: (Number(page) - 1) * Number(limit) },
                { $limit: Number(limit) }
            );
        }

        const pipeline = [
            ...basePipeline,
        ];

        leaveRequestRecords = await LeaveModal.aggregate(pipeline);
        // leaveRequestRecords = await LeaveModal.find({
        //     storeURL: session.shop,
        // });

        // console.log('leaveRequestRecords from getLeavesData', leaveRequestRecords);

        return json({
            message: 'success',
            data: leaveRequestRecords,
            hasNextPageS: hasNextPage,
            hasPrevPageS: hasPrevPage,
            totalItemsS: totalItems,
            limit
        })

    } catch (error) {
        console.error("Error from attendance:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};

