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
    

    await driver.get('http://13.56.115.82:8080/admin/master/console/');
    

    await driver.get('http://13.56.115.82:8080/admin/master/console/#/qbit');
    
}

async function createUser(driver,username, password) {

    // Your Selenium code to create a user using the provided username and password
    // For example, navigate to the registration page, fill in the form, and submit it.

   
    // await 500;
    await driver.get('http://13.56.115.82:8080/admin/master/console/#/qbit/users/add-user'); // Replace with the actual login page URL
    
    

    const timeout = 20000;
    const name = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section/form/div[2]/div[2]/input'), timeout));
    await name.clear();
    await name.sendKeys(username);

    const addButton = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section/form/div[8]/div/div/button[1]'), timeout)); // Replace with the actual ID of the username input field
    await addButton.click();

    const credentialsButton = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/nav/ul/li[3]/a/span'), timeout));
    await credentialsButton.click();
    
    const setPwButton = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section[2]/div/div/button'),timeout))
    await setPwButton.click();
    await 10000;

    const inputText = (password);
    const pw = await driver.wait(until.elementLocated(By.xpath('/html/body/div[6]/div/div/div/div/form/div[1]/div[2]/div/input'),timeout))
    await pw.clear();
    await pw.sendKeys(inputText);
  

    const ConfirmPw = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/div/form/div[2]/div[2]/div[1]/input'),timeout))
    await ConfirmPw.clear();
    await ConfirmPw.sendKeys(inputText);
   

    const toggle = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/div/form/div[3]/div[2]/label/span[1]'),timeout))
    if (toggle.isSelected()) {
      toggle.click(); // Toggles it off
    }
    await driver.sleep(500);
    const savePw = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/footer/button[1]'),timeout))
    await savePw.click();
    await driver.sleep(500);
    const confirmPW = await driver.wait(until.elementLocated(By.xpath('/html/body/div[7]/div/div/div/footer/button[1]'),timeout))
    await confirmPW.click();
    await driver.sleep(500);
    const goToDetails = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/nav/ul/li[1]/a/span'),timeout))
    await goToDetails.click();
    await driver.sleep(500);
    const saveUser = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div/main/section[3]/section[1]/section/form/div[9]/div/div/button[1]'),timeout))
    await saveUser.click();
    await driver.sleep(500);

    await driver.get('http://13.56.115.82:8080/admin/master/console/#/qbit/users');
   
}



async function main() {

    const csvFile = 'user_credentials.csv';
    const userData = await readCSV(csvFile);

    if (userData.length === 0) {
        console.log('No user credentials found in the .csv file.');
        return;
    }

    // const driver = await new Builder().forBrowser('chrome').build();

    const chromeOptions = new chrome.Options();

    //chromeOptions.addArguments('--headless');
    const driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();


    try {

        await driver.manage().window()
        // Log in to the admin dashboard only once
        await driver.get(
            'http://13.56.115.82:8080/realms/master/protocol/openid-connect/auth?client_id=security-admin-console&redirect_uri=http%3A%2F%2F13.56.115.82%3A8080%2Fadmin%2Fmaster%2Fconsole%2F&state=33c3081d-5fc7-4b7e-88b9-ca336b97ad58&response_mode=fragment&response_type=code&scope=openid&nonce=a69c0ab6-c31e-4839-8ecb-30107f96aef2&code_challenge=Wh4gpad35utVXObZQGjEDrhJnK6HBQpa_jIyn8aCfhA&code_challenge_method=S256'
            ); // Replace with the admin login URL
        await loginToAdminDashboard(driver);

        for (const user of userData) {
            const username = user.username;
            const password = user.password;
            

            await driver.get(
                'http://13.56.115.82:8080/admin/master/console/#/qbit/users'
                ); // Replace with your registration URL
                console.log('username:', username);
                console.log('password:', password);
            await createUser(driver,username,password);
        }
    } finally {
        await driver.quit();
    }
}

main();
