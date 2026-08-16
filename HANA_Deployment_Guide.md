# SAP HANA Database Deployment Guide

To get your screenshot of the **SAP HANA Database Explorer** for your Mettl assignment, follow these exact steps inside your SAP Business Application Studio (BAS):

## Step 1: Prepare the Project for SAP HANA
Currently, your project is using a local SQLite database. We need to tell the project to use SAP HANA for production. 
In your BAS terminal, run these commands:
```bash
cds add hana --for production
npm install
```
*(This will add the HANA database driver and configurations to your project).*

## Step 2: Deploy using SAP HANA Projects Explorer
SAP BAS has a built-in tool that makes deploying the database incredibly easy without needing to write complex deployment scripts.

1. Look at the very left sidebar of your SAP BAS screen (where the File Explorer icon is).
2. Click on the **SAP HANA Projects** icon. *(If you don't see it, go to the top menu: `View` -> `Open View...` and type "SAP HANA Projects")*.
3. In the SAP HANA Projects panel, it should automatically detect your `db` folder. 
4. Hover over your project name in that panel, and click the **Deploy** icon (it looks like a little rocket ship or play button).
5. A prompt will appear at the top of your screen asking you to bind to an HDI container. Select **Create a new HDI service instance** and press Enter. 

BAS will now spend a minute or two creating an SAP HANA HDI container in the cloud and deploying your `Customers`, `Transactions`, and `Redemptions` tables into it!

## Step 3: Open SAP HANA Database Explorer
Once the deployment finishes successfully in the terminal:
1. Go back to the **SAP HANA Projects** panel on the left.
2. Under your project, you will now see your newly created HDI container instance (it usually has a green checkmark next to it).
3. Hover over it and click the **Open in SAP HANA Database Explorer** icon (it looks like a small database cylinder with an arrow or magnifying glass).
4. A new browser tab will open for the SAP HANA Database Explorer. It will ask for your SAP login if you aren't logged in.

## Step 4: Take Your Screenshot
1. In the SAP HANA Database Explorer, look at the left panel under your HDI container.
2. Expand the **Catalog** folder, and then click on **Tables**.
3. You will see your `LOYALTY_CUSTOMERS`, `LOYALTY_TRANSACTIONS`, etc., tables listed!
4. **Take a screenshot** of this screen showing the tables on the left and the SAP HANA logo on the right. 

This screenshot proves you successfully designed your Data Model and deployed it to a real SAP HANA database!
