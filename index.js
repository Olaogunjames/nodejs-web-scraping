// Import the puppeteer package for scraping web pages
const puppeteer = require('puppeteer');
// Import the fs (file system) package for handling file operations
const fs = require('fs');
// Import the papaparse package for parsing the review data
const papaparse = require("papaparse");

// This function opens up the web page and shows its HTML code
async function scrapePageHtml(url, signinURL) {
    // Start the browser and open a new page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate to the login page URL
    await page.goto(signinURL);
    // Wait for the email input field to be present in the page's DOM
    await page.waitForSelector("input[name=email]");
    // Type the email address into the email field with a slight delay to simulate the real typing
    await page.type("input[name=email]", "YOUR_EMAIL_ADDRESS", { delay: 100 });
    // Click the 'Continue' button after typing in the email
    await page.click("input[id=continue]");
    // Wait for the password input field to be present after clicking 'Continue'
    await page.waitForSelector("input[name=password]");
    // Type the password into the password field with a slight delay to mimic real typing
    await page.type("input[name=password]", "YOUR_PASSWORD", { delay: 100 });
    // Click the 'Sign In' button after entering the password
    await page.click("input[id=signInSubmit]");

    // Wait for the navigation to happen after clicking 'Sign In', indicating that the login process is complete
    await page.waitForNavigation();

    // Log a message to the console once the navigation is done, which means we've logged in successfully
    console.log('Login successful');

    // Go to the product page
    await page.goto(url, { timeout: 60000 });
    
    // Get the HTML code from the page
    const content = await page.content();
    
    // Print the HTML code to see it
    console.log(content);
    // Write the HTML content to a local file called 'productPage.html'
    fs.writeFileSync('productPage.html', content);

    // Wait for the elements with the class ".review" to be rendered on the page
    await page.waitForSelector(".review");

    // Extract information from the first 10 review elements on the page
    const reviews = await page.$$eval(".review", (reviewElements) => {
        // Take the first 10 elements from the list of all elements with the class ".review"
        return reviewElements.slice(0, 10).map((review) => {
            // Find each author's name and extract the text content
            const author = review.querySelector(".a-profile-name").textContent;
            // Find each review text within a container that has the class ".a-row.a-spacing-small.review-data" and extract the text content
            const text = review.querySelector(".a-row.a-spacing-small.review-data").textContent;
            // Find each review date element with the class ".review-date" and extract its text content
            const date = review.querySelector(".review-date").textContent;
            
            // Return an object containing the author, text, and date for each review
            return { author, text, date };
        });
    });

    // Export the data to a CSV file
    const csvData = papaparse.unparse(reviews);
    fs.writeFileSync("reviews.csv", csvData);
    
    // All done! Close the browser.
    await browser.close();
}

// The web address of the product page
const productPage = "https://www.amazon.com/ENHANCE-Headphone-Customizable-Lighting-Flexible/dp/B07DR59JLP/";

const signinURL = "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fcart%2Fadd-to-cart%2Fref%3Dnav_custrec_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0";

// Run the scrape page function and also catch any error.
scrapePageHtml(productPage, signinURL).catch(error => console.error('An error occurred:', error));