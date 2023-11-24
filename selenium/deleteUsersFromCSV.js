const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const csv = require('csv-parser');


// Function to read the .csv file and return an array of objects
async function readCSV(filePath) {
    const data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            });
    });
}



async function loginToAdminDashboard(driver) {
    // Find and interact with login page elements
    const usernameField = await driver.findElement(By.id('username')); // Replace with the actual ID of the username input field
    const passwordField = await driver.findElement(By.id('password')); // Replace with the actual name of the password input field
    const loginButton = await driver.findElement(By.id('kc-login')); // Replace with the actual ID of the login button
   
     // Enter login credentials
    await usernameField.sendKeys('admin'); // Replace with a valid username
    await passwordField.sendKeys('admin'); // Replace with a valid password
    // Click the login button
    await loginButton.click();
    await 2000;

    await driver.get('http://13.56.115.82:8080/admin/master/console/');
    await 500;

    await driver.get('http://13.56.115.82:8080/admin/master/console/#/qbit');
    await 500;
}


// async function deleteUser(driver,username) {
   
//         // Replace 'table_id' with the actual ID of your table
//         // let table = await driver.findElement(By.xpath('/html/body/div[1]/div/main/section[3]/section/table'));
//         let table = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section/table')), 20000);
   
//         // Replace 'desired_username' with the username you want to find
//         let desiredUsername = username;

//         let foundRow = null;
        
//         // Find all table rows
//         let rows = await table.findElements(By.css('tr'));
       
//         for (let row of rows) {
//             // Assuming the username is in a specific column (e.g., the first column)
//             let usernameCell = await row.findElement(By.xpath('.//td[2]')); // Modify the XPath as needed

//             let usernameText = await usernameCell.getText();

//             if (usernameText === desiredUsername) {
//                 foundRow = row;
                
//             }
//         }
     
//         // Do something with the found row
//         if (foundRow) {
//             console.log('Found the row with the username:', await foundRow.getText());
//             // /html/body/div[1]/div/main/section[3]/section/table/tbody/tr[1]/td[7]/div/button
//             let dotButton = await foundRow.findElement(By.xpath('.//td[7]'));
//             await dotButton.click();

//             let deleteButon = await foundRow.findElement(By.xpath('.//td[7]/div/ul/li/button'));
//             // /html/body/div[1]/div/main/section[3]/section/table/tbody/tr[2]/td[7]/div/ul/li/button
//             await deleteButon.click();

//             let deleteUser = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/footer/button[1]')), 10000);
//             await deleteUser.click();  

//         } else {
//             console.log('Username not found in the table');
//         }
   
    
// }



// async function main() {
//     const csvFile = 'delete_user.csv';
//     const userData = await readCSV(csvFile);

//     if (userData.length === 0) {
//         console.log('No user credentials found in the .csv file.');
//         return;
//     }

//     // const driver = await new Builder().forBrowser('chrome').build();

//     const chromeOptions = new chrome.Options();

//     //chromeOptions.addArguments('--headless');
//     const driver = new Builder()
//       .forBrowser('chrome')
//       .setChromeOptions(chromeOptions)
//       .build();


//     try {

//         await driver.manage().window()
//         // Log in to the admin dashboard only once
//         await driver.get(
//             'http://13.56.115.82:8080/realms/master/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=http%3A%2F%2F13.56.115.82%3A8080%2Fadmin%2Fmaster%2Fconsole%2F&state=33c3081d-5fc7-4b7e-88b9-ca336b97ad58&response_mode=fragment&response_type=code&scope=openid&nonce=a69c0ab6-c31e-4839-8ecb-30107f96aef2&code_challenge=Wh4gpad35utVXObZQGjEDrhJnK6HBQpa_jIyn8aCfhA&code_challenge_method=S256'
//             ); // Replace with the admin login URL
//         await loginToAdminDashboard(driver);


//         for (const user of userData) {
//             const username = user.username;
//         await driver.get(
//             'http://13.56.115.82:8080/admin/master/console/#/qbit/users'
//             ); // Replace with your registration URL

//         await deleteUser(driver,username);

//         }

//         await driver.sleep(20000);


//     } finally {
//         await driver.quit();
//     }
// }


// main();
async function deleteUser(driver, username) {
    let foundRow = null;

    try {
        let table = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section/table')), 10000);

        let desiredUsername = username;

        let rows = await table.findElements(By.css('tr'));

        for (let row of rows) {
            let usernameCell = await row.findElement(By.xpath('.//td[2]'));

            let usernameText = await usernameCell.getText();

            if (usernameText === desiredUsername) {
                foundRow = row;
                break; // Found the user, exit the loop
            }
        }

        if (foundRow) {
            console.log('Found the row with the username:', await foundRow.getText());

            let dotButton = await foundRow.findElement(By.xpath('.//td[7]'));
            await dotButton.click();

            let deleteButton = await foundRow.findElement(By.xpath('.//td[7]/div/ul/li/button'));
            await deleteButton.click();

            let deleteUser = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/footer/button[1]')), 10000);
            await deleteUser.click();
        } else {
            console.log('Username not found in the table');
        }
    } catch (error) {
        // Handle the stale element reference error by retrying the operation
        console.log('StaleElementReferenceError encountered. Retrying...');
        await deleteUser(driver, username);
    }
}


async function main() {
    const csvFile = 'delete_user.csv';
    const userData = await readCSV(csvFile);

    if (userData.length === 0) {
        console.log('No user credentials found in the .csv file.');
        return;
    }

    const chromeOptions = new chrome.Options();
    const driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    try {
        await driver.manage().window();
        await driver.get(
            'http://13.56.115.82:8080/realms/master/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=http%3A%2F%2F13.56.115.82%3A8080%2Fadmin%2Fmaster%2Fconsole%2F&state=33c3081d-5fc7-4b7e-88b9-ca336b97ad58&response_mode=fragment&response_type=code&scope=openid&nonce=a69c0ab6-c31e-4839-8ecb-30107f96aef2&code_challenge=Wh4gpad35utVXObZQGjEDrhJnK6HBQpa_jIyn8aCfhA&code_challenge_method=S256'
        ); // Replace with the admin login URL
        await loginToAdminDashboard(driver);

        for (const user of userData) {
            const username = user.username;
            await driver.get(('http://13.56.115.82:8080/admin/master/console/#/qbit/users'),2000); // Replace with your users list URL
            await deleteUser(driver, username);
            // After deleting a user, navigate back to the user list
            await driver.get(('http://13.56.115.82:8080/admin/master/console/#/qbit/users'),2000);
        }

        // Once all users are deleted, quit the driver
       // await driver.sleep(20000);

    } finally {
        await driver.quit();
    }
}

main();
