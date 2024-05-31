import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import AttendanceModel from "../MONGODB/Attendance";


export const loader = async ({ params, request }) => {
    console.log('params from getAttendance', params);
    console.log('new date', new Date(params.todaysDate));

    const query = JSON.parse(params.query)
    const limit = params.limit
    const page = params.page

    console.log('limit from getAttendanace', limit)
    console.log('page from getAttendance', page);
    console.log('query from getAttendance', query)

    try {
        const { admin, session } = await authenticate.admin(request);

        let attendanceRecord;
        let totalItems;
        let totalPages;
        let hasNextPage;
        let hasPrevPage

        if (params.email !== 'false') {


            const gotData = await AttendanceModel.find({
                storeURL: session.shop,
                email: params.email,
            });

            attendanceRecord = gotData.filter((d, i) => {
                console.log('new Date(d.out_time).toLocaleDateString()', d.out_time?.toLocaleDateString());
                console.log('new Date(params.todaysDate)', new Date(params.todaysDate)?.toLocaleDateString());
                if (d.out_time === null) {
                    return d
                }
                else if (d.out_time.toLocaleDateString() === new Date(params.todaysDate).toLocaleDateString()) {
                    return d
                }
            })

        } else {
            // console.log('hit else getAttendance');

            // below is the working code but optimization and scalibility issue

            // const queryRegex = new RegExp(query.queryName.replace(/\s+/g, ''), 'i');

            // const matchStage = (query.queryName !== 'All') ? {
            //     storeURL: session.shop,
            //     $expr: {
            //         $regexMatch: {
            //             input: {
            //                 $concat: [
            //                     "$userDetails.firstName",
            //                     "$userDetails.lastName",
            //                 ]
            //             },
            //             regex: queryRegex
            //         }
            //     }
            // } : {
            //     storeURL: session.shop
            // };

            // // console.log('matchStage.//....././//',matchStage);

            // const countPipeline = [
            //     {
            //         $lookup: {
            //             from: "users",
            //             localField: "email",
            //             foreignField: "email",
            //             as: "userDetails"
            //         }
            //     },
            //     { $unwind: "$userDetails" },
            //     { $match: matchStage },
            //     { $count: "totalItems" }
            // ];

            // // console.log('countPipeline....../......../...',countPipeline);

            // const resultFromCount = await AttendanceModel.aggregate(countPipeline);
            // totalItems = resultFromCount.length > 0 ? resultFromCount[0].totalItems : 0;
            // totalPages = Math.ceil(totalItems / limit);
            // hasNextPage = page < totalPages;
            // hasPrevPage = page > 1;

            // const pipeline = [
            //     {
            //         $lookup: {
            //             from: "users",
            //             localField: "email",
            //             foreignField: "email",
            //             as: "userDetails"
            //         }
            //     },
            //     { $unwind: "$userDetails" },
            //     { $match: matchStage },
            // ];

            // if (!query.startDate && !query.endDate) {
            //     pipeline.push(
            //         { $skip: (Number(page) - 1) * Number(limit) },
            //         { $limit: Number(limit) }
            //     );
            // }

            // attendanceRecord = await AttendanceModel.aggregate(pipeline);

            // if (query.startDate && !query.endDate) {
            //     attendanceRecord = attendanceRecord.filter((d, i) => {

            //         if (d.in_time?.toLocaleDateString() >= new Date(query.startDate).toLocaleDateString()) {
            //             // console.log('new Date(query.startDate).toLocaleDateString()',new Date(query.startDate).toLocaleDateString());
            //             return d
            //         }

            //     })
            // } else if (query.startDate && query.endDate) {
            //     attendanceRecord = attendanceRecord.filter((d, i) => {
            //         if (d.in_time?.toLocaleDateString() >= new Date(query.startDate).toLocaleDateString() &&
            //             d.in_time?.toLocaleDateString() <= new Date(query.endDate).toLocaleDateString()) {
            //             return d
            //         }

            //     })
            // } else {

            // }

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
                dateFilter.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                dateFilter.$lte = new Date(query.endDate);
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



            // console.log('attendanceRecord from getAttendance', attendanceRecord);

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

