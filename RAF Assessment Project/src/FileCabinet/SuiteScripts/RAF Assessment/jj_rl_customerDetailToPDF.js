/*****************************************************************************************************************************************************************************************
**************************
*
*${RAFF Assesment}:${Create a page to display the details of universities using data from hipolabs.com.}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 10-May-2024
 *
 * Created by :Sanket Pal , Jobin and Jismi IT Services.
 *
 * Description : Create a page to display the details of universities using data from hipolabs.com.
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/file', 'N/search', 'N/record', 'N/email', 'N/render'],
    /**
 * @param{email} email
 * @param{record} record
 * @param{search} search
 */
    (file, search, record, email, render) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        // const get = (requestParams) => {

        // }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        // const put = (requestBody) => {

        // }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
            try {
                var folderName = requestBody['Folder Name'];
                var emailAddress = requestBody['Email'];
                var startDate = requestBody['startDate'];

                if (!folderName || !emailAddress || !startDate) {
                    return { 
                        status: 'error',
                        message: 'Please provide all the field values'
                    };
                }

                var existingFolder = searchFolderByName(folderName);
                if (existingFolder) {
                    return {
                        status: 'error',
                        message: 'Folder already exists'
                    };
                }

                var folderId = createFolder(folderName);

                var mapReduceTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_your_map_reduce_script',
                    deploymentId: 'customdeploy_your_map_reduce_script',
                    params: {custscript_folder_id: folderId, custscript_start_date: startDate}
                });
                var taskId = mapReduceTask.submit();

                sendEmailNotification(emailAddress);

                return {
                    status: 'success',
                    message: `Customer statements generated in folder ID: ${folderId} and email sent to ${emailAddress}`
                };
            } catch (error) {
                return { status: 'error', message: 'Failed to process request: ' + error.message };
            }
        }

        function searchFolderByName(folderName) {
            var folderSearch = search.create({
                type: search.Type.FOLDER,
                filters: [['name', search.Operator.IS, folderName]],
                columns: ['internalid']
            });
            var result = folderSearch.run().getRange({ start: 0, end: 1 });
            return result.length ? result[0].getValue({ name: 'internalid' }) : null;
        }

        function createFolder(folderName) {
            var folderRecord = record.create({ type: record.Type.FOLDER });
            folderRecord.setValue('name', folderName);
            return folderRecord.save();
        }

        function generateCustomerStatements(startDate, folderId) {
            var customerSearch = search.create({
                type: search.Type.CUSTOMER,
                columns: ['internalid']
            });

            customerSearch.run().each(function(result) {
                var customerId = result.getValue({ name: 'internalid' });
                var customerIdInt = parseInt(customerId);
                var fileName = customerId + '_' + Math.floor(new Date().getTime() / 1000) + '.pdf';

                var statementOpts = {
                    entityId: customerIdInt,
                    printMode: render.PrintMode.PDF,
                    inCustLocale: true,
                    startDate: startDate
                };
                var statement = render.statement(statementOpts);
                var pdfContents = statement.getContents();

                var createFile = file.create({
                    name: fileName,
                    fileType: file.Type.PDF,
                    contents: pdfContents,
                    folder: folderId
                });
                createFile.save();
                return true;
            });
        }

        function sendEmailNotification(emailAddress) {
            email.send({
                author: -5,
                recipients: emailAddress,
                subject: 'Customer Statements Generated',
                body: 'All customer statements have been successfully generated and saved.'
            });
        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        // const doDelete = (requestParams) => {

        // }

        return {post}

    });
