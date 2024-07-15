import { authenticate } from "../shopify.server";
// import userModel from "../MONGODB/UserModel";
import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
    try {
        const { session } = await authenticate.admin(request);

        const query = JSON.parse(params.query);
        const limit = parseInt(params.limit);
        const page = parseInt(params.page);

        let totalPages;
        let hasNextPage;
        let hasPrevPage;

        const queryRegex = query !== 'All' ? new RegExp(query.replace(/\s+/g, '\\s*'), 'i') : /.*/;
        /*

        const matchStage = query !== 'All' ? {
            storeURL: session.shop,
            $expr: {
                $regexMatch: {
                    input: {
                        $concat: [
                            "$firstName",
                            " ",
                            "$lastName",
                        ]
                    },
                    regex: queryRegex
                }
            }
        } : {
            storeURL: session.shop
        };

        const basePipeline = [
            { $match: matchStage }
        ];

        const countPipeline = [
            ...basePipeline,
            { $count: "count" }
        ];

        const [totalItems] = await userModel.aggregate(countPipeline);

        totalPages = Math.ceil(totalItems ? totalItems.count / limit : 1);
        hasNextPage = page < totalPages;
        hasPrevPage = page > 1;

        basePipeline.push(
            { $sort: { isAdmin: -1, firstName: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        );

        const pipeline = [
            ...basePipeline
        ];

        const gotAllUsers = await userModel.aggregate(pipeline);
        */

        const matchStage = {
            where: {
                AND: [
                    { storeURL: session.shop },
                    query !== 'All' ? {
                        OR: [
                            { firstName: { contains: query, mode: 'insensitive' } },
                            { lastName: { contains: query, mode: 'insensitive' } }
                        ]
                    } : {}
                ]
            }
        };

        const totalItems = await prisma.users.count(matchStage);
        totalPages = Math.ceil(totalItems / limit);
        hasNextPage = page < totalPages;
        hasPrevPage = page > 1;

        const gotAllUsers = await prisma.users.findMany({
            ...matchStage,
            orderBy: [
                { isAdmin: 'desc' },
                { firstName: 'asc' }
            ],
            skip: (page - 1) * limit,
            take: limit
        });

        return json({
            message: "Got all users successfully",
            data: gotAllUsers,
            totalItems: totalItems,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (error) {
        console.log('error occurred while getting all users', error);
        return json({
            message: 'error occurred while getting all users',
            error: error.message
        });
    }
};
