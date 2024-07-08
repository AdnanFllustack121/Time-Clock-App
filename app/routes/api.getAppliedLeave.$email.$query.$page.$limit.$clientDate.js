import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import LeaveModal from "../MONGODB/LeaveModal.";


export const loader = async ({ params, request }) => {
    const query = JSON.parse(params.query)
    const limit = params.limit
    const page = params.page

    try {
        const { admin, session } = await authenticate.admin(request);

        let leaveRequestRecords;
        let totalItems;
        let totalPages;
        let hasNextPage;
        let hasPrevPage;

        const queryRegex = new RegExp(query.queryKeyword.replace(/\s+/g, '\\s*'), 'i');

        const matchStage = {
            storeURL: session.shop,
        };

        if (params.email !== 'false') {
            matchStage.createdBy = params.email
            if (query.queryKeyword !== 'All') {
                matchStage.reason = {
                    $regex: queryRegex
                }
            }
        }

        const dateFilter = {};
        if (query.startDate) {
            const startDate = new Date(query.startDate);
            startDate.setHours(0, 0, 0, 0);
            dateFilter.$gte = startDate;
        }
        if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999);
            dateFilter.$lte = endDate;
        }

        const basePipeline = [];

        if (params.email === 'false') {
            basePipeline.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "email",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" }
            )

            if (query.queryKeyword !== 'All') {
                matchStage.$expr = {
                    $regexMatch: {
                        input: {
                            $concat: [
                                "$userDetails.firstName",
                                " ",
                                "$userDetails.lastName",
                            ]
                        },
                        regex: queryRegex
                    }
                }
            }
        }

        basePipeline.push(
            { $match: matchStage }
        )


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

        basePipeline.push(
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }
        );

        const pipeline = [
            ...basePipeline,
        ];

        leaveRequestRecords = await LeaveModal.aggregate(pipeline);

        return json({
            message: 'success',
            data: leaveRequestRecords,
            hasNextPageS: hasNextPage,
            hasPrevPageS: hasPrevPage,
            totalItemsS: totalItems,
            limit
        })

    } catch (error) {
        console.error("Error from getApplied:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};
