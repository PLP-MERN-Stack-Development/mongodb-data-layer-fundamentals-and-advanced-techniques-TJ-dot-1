const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function runAllQueries() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!\n");
        const database = client.db("plp_bookstore");
        const collection = database.collection("books");

        // Task 1: Find books by genre
        console.log(" TASK 1: FIND BOOKS BY GENRE");
        console.log("==============================");
        
        console.log("\n📖 Fiction Books:");
        const fictionBooks = await collection.find({ genre: "Fiction" }).toArray();
        fictionBooks.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author}`);
        });

        console.log("\n Dystopian Books:");
        const dystopianBooks = await collection.find({ genre: "Dystopian" }).toArray();
        dystopianBooks.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author}`);
        });
        console.log("\n==============================\n");

        // Task 2: Find books published after a certain year
        console.log(" TASK 2: FIND BOOKS PUBLISHED AFTER A CERTAIN YEAR");
        console.log("=====================================================");
        
        const year = 1950;
        console.log(`\n Books published after ${year}:`);
        const recentBooks = await collection.find({ published_year: { $gt: year } }).toArray();
        recentBooks.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author} (${book.published_year})`);
        });
        console.log("=====================================================\n");

        // Task 3: Find books by a specific author
        console.log(" TASK 3: FIND BOOKS BY A SPECIFIC AUTHOR");
        console.log("=============================================");
        
        const authorName = "George Orwell";
        console.log(`\n Books by ${authorName}:`);
        const authorBooks = await collection.find({ author: authorName }).toArray();
        authorBooks.forEach(book => {
            console.log(`   - "${book.title}" (${book.published_year})`);
        });
        console.log("=============================================\n");

        // Task 4: Update the price of a certain book
        console.log(" TASK 4: UPDATE THE PRICE OF A CERTAIN BOOK");
        console.log("===============================================");
        
        const bookTitle = "1984";
        const newPrice = 9.99;
        const updateResult = await collection.updateOne(
            { title: bookTitle },
            { $set: { price: newPrice } }
        );
        if (updateResult.modifiedCount > 0) {
            console.log(`Updated the price of "${bookTitle}" to $${newPrice}`);
        } else {
            console.log(` No book found with the title "${bookTitle}"`);
        }
        console.log("===============================================\n");
        
        // Task 5: Delete a book by title
        console.log(" TASK 5: DELETE A BOOK BY TITLE");
        console.log("===================================");
        
        const deleteTitle = "The Great Gatsby";
        const deleteResult = await collection.deleteOne({ title: deleteTitle });
        if (deleteResult.deletedCount > 0) {
            console.log(` Deleted the book titled "${deleteTitle}"`);
        } else {
            console.log(` No book found with the title "${deleteTitle}"`);
        }
        console.log("===================================\n");

        // Advanced Query 1: Find books in stock and published after 1950
        console.log("\n📚 ADVANCED QUERY 1: Books in stock AND published after 1950:");
        const inStockRecent = await collection.find({
            in_stock: true,
            published_year: { $gt: 1950 }
        }, {
            projection: { title: 1, author: 1, price: 1, published_year: 1, _id: 0 }
        }).toArray();
        
        console.log(`   Found ${inStockRecent.length} books:`);
        inStockRecent.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author} (${book.published_year}) - $${book.price}`);
        });

        // Advanced Query 2: Using projection - only specific fields
        console.log("\n ADVANCED QUERY 2: All books with only title and author fields:");
        const allBooksProjection = await collection.find({}, {
            projection: { title: 1, author: 1, _id: 0 }
        }).toArray();
        
        console.log(`   Found ${allBooksProjection.length} books:`);
        allBooksProjection.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author}`);
        });

        // Advanced Query 3: Sort books by price in descending order
        console.log("\n ADVANCED QUERY 3: All books sorted by price (high to low):");
        const sortedByPrice = await collection.find({}, {
            projection: { title: 1, author: 1, price: 1, _id: 0 },
            sort: { price: -1 }
        }).toArray();
        
        console.log(`   Found ${sortedByPrice.length} books:`);
        sortedByPrice.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author} - $${book.price}`);
        });

        // Advanced Query 4: Sorting books by published year in ascending order
        console.log("\n ADVANCED QUERY 4: All books sorted by published year (oldest to newest):");
        const sortedByYear = await collection.find({}, {
            projection: { title: 1, author: 1, published_year: 1, _id: 0 },
            sort: { published_year: 1 }
        }).toArray();
        
        console.log(`   Found ${sortedByYear.length} books:`);
        sortedByYear.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author} (${book.published_year})`);
        });

        // Advanced Query 5: Pagination - get the first 5 books using limit and skip
        console.log("\n ADVANCED QUERY 5: First 5 books (pagination):");
        const firstFiveBooks = await collection.find({}, {
            projection: { title: 1, author: 1, _id: 0 },
            limit: 5,
            skip: 0
        }).toArray();
        
        console.log(`   Found ${firstFiveBooks.length} books:`);
        firstFiveBooks.forEach(book => {
            console.log(`   - "${book.title}" by ${book.author}`);
        });

        // Aggregation 1: Average price by genre
        console.log("\n AGGREGATION 1: Average book price per genre:");
        const avgPricePerGenre = await collection.aggregate([
            {
                $group: {
                    _id: "$genre",
                    averagePrice: { $avg: "$price" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    genre: "$_id",
                    averagePrice: { $round: ["$averagePrice", 2] },
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { averagePrice: -1 }
            }
        ]).toArray();
        
        avgPricePerGenre.forEach(genre => {
            console.log(`   - ${genre.genre}: $${genre.averagePrice} (based on ${genre.count} books)`);
        });

        // Aggregation 2: Author with the most books
        console.log("\n AGGREGATION 2: Author with the most books:");
        const topAuthor = await collection.aggregate([
            {
                $group: {
                    _id: "$author",
                    bookCount: { $sum: 1 }
                }
            },
            { $sort: { bookCount: -1 } },
            { $limit: 1 },
            {
                $project: { author: "$_id", bookCount: 1, _id: 0 }
            }
        ]).toArray();
        
        if (topAuthor.length > 0) {
            console.log(`   - ${topAuthor[0].author} with ${topAuthor[0].bookCount} books`);
        } else {
            console.log("   - No authors found.");
        }

        // Aggregation 3: Books by publication decade
        console.log("\n AGGREGATION 3: Books Grouped by Publication Decade:");
        const booksByDecade = await collection.aggregate([
            {
                $addFields: {
                    decade: {
                        $concat: [
                            { $toString: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } },
                            "s"
                        ]
                    },
                    decadeStart: {
                        $subtract: [
                            "$published_year",
                            { $mod: ["$published_year", 10] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$decade",
                    decadeStart: { $first: "$decadeStart" },
                    bookCount: { $sum: 1 },
                    books: { 
                        $push: { 
                            title: "$title", 
                            author: "$author", 
                            year: "$published_year",
                            price: "$price"
                        } 
                    },
                    averagePrice: { $avg: "$price" }
                }
            },
            {
                $project: {
                    decade: "$_id",
                    decadeStart: 1,
                    bookCount: 1,
                    averagePrice: { $round: ["$averagePrice", 2] },
                    sampleBooks: { $slice: ["$books", 3] },
                    _id: 0
                }
            },
            {
                $sort: { decadeStart: 1 }
            }
        ]).toArray();

        booksByDecade.forEach(decade => {
            console.log(`   ${decade.decade}:`);
            console.log(`      Total Books: ${decade.bookCount}`);
            console.log(`      Average Price: $${decade.averagePrice}`);
            console.log(`      Sample Books:`);
            decade.sampleBooks.forEach(book => {
                console.log(`        - "${book.title}" (${book.year}) - $${book.price}`);
            });
        });

        // Index Creation and Performance
        console.log("\n⚡ INDEX CREATION AND PERFORMANCE DEMONSTRATION:");
        
        // Create indexes
        try {
            const titleIndexName = await collection.createIndex({ title: 1 });
            console.log(` Created index on 'title' field: ${titleIndexName}`);
        } catch (error) {
            console.log("ℹ Index on 'title' already exists");
        }

        try {
            const compoundIndexName = await collection.createIndex({ author: 1, published_year: -1 });
            console.log(` Created compound index on 'author' and 'published_year': ${compoundIndexName}`);
        } catch (error) {
            console.log(" Compound index on 'author' and 'published_year' already exists");
        }

        // Performance comparison
        console.log("\n QUERY PERFORMANCE COMPARISON:");

        // Query with title index
        const queryTitle = "1984";
        const withIndexExplain = await collection.find({ title: queryTitle }).explain("executionStats");
        console.log(` Query: Find book titled "${queryTitle}"`);
        console.log(`   With Index - Execution Time: ${withIndexExplain.executionStats.executionTimeMillis} ms`);
        console.log(`   Documents Examined: ${withIndexExplain.executionStats.totalDocsExamined}`);

        // Query without index (using publisher field)
        const collectionScanQuery = { publisher: "HarperOne" };
        const collectionScanExplain = await collection.find(collectionScanQuery).explain("executionStats");
        console.log(`\n Query: Find books by publisher 'HarperOne'`);
        console.log(`   Without Index - Execution Time: ${collectionScanExplain.executionStats.executionTimeMillis} ms`);
        console.log(`   Documents Examined: ${collectionScanExplain.executionStats.totalDocsExamined}`);

        // Query with compound index
        const compoundQuery = { 
            author: "George Orwell", 
            published_year: { $gte: 1940 } 
        };
        const compoundExplain = await collection.find(compoundQuery).explain("executionStats");
        console.log(`\n Query: Find books by George Orwell published after 1940`);
        console.log(`   With Compound Index - Execution Time: ${compoundExplain.executionStats.executionTimeMillis} ms`);
        console.log(`   Documents Examined: ${compoundExplain.executionStats.totalDocsExamined}`);

    } catch (error) {
        console.error(" Error:", error);
    } finally {
        await client.close();
        console.log("\n Connection closed");
    }
}

// Call the function
runAllQueries();