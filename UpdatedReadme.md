** How to Run the Scripts
1. First, insert the book data:

node insert_books.js

This will create a database called bookstore and insert 12 sample books.



2. Then, run all the queries:

node queries.js


What Each Script Does
insert_books.js

    Creates a MongoDB database called bookstore

    Creates a collection called books

    Inserts 12 sample books with details like title, author, genre, price, etc.

queries.js

Runs various MongoDB operations:

Basic Queries:

    Find books by genre

    Find books published after a certain year

    Find books by specific authors

    Update book prices

    Delete books by title

Advanced Queries:

    Find books in stock published after certain years

    Use projection to return specific fields

    Sort books by price and publication year

    Implement pagination

    Aggregation Pipelines:

    Calculate average price by genre

    Find authors with most books

    Group books by publication decade

Performance:

    Create indexes for faster searches

    Compare query performance with and without indexes

    Expected Output

When you run queries.js, you should see:

    Lists of books filtered by genre, author, etc.

    Updated book prices

    Aggregated statistics (average prices, author counts, etc.)

    Performance metrics showing how indexes improve speed

    Troubleshooting

If scripts don't show output:

    Make sure MongoDB is running: brew services list | grep mongo

    Check if books were inserted: node insert_books.js first

    Verify the database name matches in both scripts

If you get connection errors:

    Ensure MongoDB is installed and running

    Check that you're using the correct connection string: mongodb://localhost:27017

    Notes

    The project uses the official MongoDB Node.js driver

    All data is stored locally on your computer

    You can modify the book data in insert_books.js to add your own books