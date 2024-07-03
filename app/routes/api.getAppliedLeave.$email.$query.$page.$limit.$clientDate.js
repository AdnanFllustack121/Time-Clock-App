import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import LeaveModal from "../MONGODB/LeaveModal.";


export const loader = async ({ params, request }) => {
    console.log('params from getLeavesData', params);
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
        let hasPrevPage;

        const queryRegex = new RegExp(query.queryKeyword.replace(/\s+/g, '\\s*'), 'i');

        const matchStage = {
            storeURL: session.shop,
        };

        if (params.email !== 'false') {
            // console.log('params.email hit');
            matchStage.createdBy = params.email
            if (query.queryKeyword !== 'All') {
                console.log('hit all queryKeyword', queryRegex);
                matchStage.reason = {
                    $regex: queryRegex
                }
            }
        }
        // else {
        //     console.log('params.email not hit');
        //     matchStage.status = 'Pending'
        // }

        // console.log('matchStage', matchStage);

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



        // console.log('dateFilter......', dateFilter);
        const basePipeline = [


        ];

        if (params.email === 'false') {
            // console.log('hit param.email baseline push');
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

            // const approvedDateFilter = {}
            // const startDate = new Date(params.clientDate)
            // console.log('params.clientDate', params.clientDate);
            // console.log('startDate.........', startDate);
            // approvedDateFilter.$gte = startDate
            // basePipeline.push({
            //     $match: { "startDate": approvedDateFilter }
            // })

            if (query.queryKeyword !== 'All') {
                // console.log('hit not all not params.email queryRegex', queryRegex);
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

                // basePipeline.push({
                //     $match: {
                //         $expr: {
                //             $regexMatch: {
                //                 input: {
                //                     $concat: [
                //                         "$userDetails.firstName",
                //                         " ",
                //                         "$userDetails.lastName",
                //                     ]
                //                 },
                //                 regex: queryRegex
                //             }
                //         }
                //     }
                // });
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

        // if (!query.startDate && !query.endDate) {
        basePipeline.push(
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }
        );
        // }

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
        console.error("Error from getApplied:", error);
        return json({ error: 'Failed server request.', message: error.message });
    }
};
