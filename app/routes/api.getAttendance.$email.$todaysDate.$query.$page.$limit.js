import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const loader = async ({ params, request }) => {
    const query = JSON.parse(params.query)
    const limit = params.limit
    const page = params.page

    try {
        const { admin, session } = await authenticate.admin(request);

        let attendanceRecord;
        let totalItems;
        let totalPages;
        let hasNextPage;
        let hasPrevPage

        if (params.email !== 'false') {

            // old code working fine but not sorted
            const gotData = await AttendanceModel.find({
                storeURL: session.shop,
                email: params.email,
            });

            attendanceRecord = gotData.filter((d, i) => {
                if (d.out_time === null) {
                    return d
                }
                else if (d.out_time.toLocaleDateString() === new Date(params.todaysDate).toLocaleDateString()) {
                    return d
                }
            })



        } else {
            // FOR NOW WOKING BELOW CODE IS BUT NOT SURE HOW GOOD
            const queryRegex = new RegExp(query.queryName.replace(/\s+/g, '\\s*'), 'i');

            const matchStage = (query.queryName !== 'All') ? {
                storeURL: session.shop,
                $expr: {
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
            } : {
                storeURL: session.shop
            };

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

            const basePipeline = [
                {
                    $lookup: {
                        from: "users",
                        localField: "email",
                        foreignField: "email",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                { $match: matchStage }
            ];

            if (Object.keys(dateFilter).length > 0) {
                basePipeline.push({
                    $match: { "in_time": dateFilter }
                });
            }

            basePipeline.push({
                $sort: { "in_time": -1 }
            });

            const countPipeline = [
                ...basePipeline,
                { $count: "totalItems" }
            ];

            const resultFromCount = await AttendanceModel.aggregate(countPipeline);
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

            attendanceRecord = await AttendanceModel.aggregate(pipeline);
        }

        return json({
            message: 'success',
            attendanceData: attendanceRecord,
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

