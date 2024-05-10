/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/http', 'N/url'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (serverWidget, http, url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'University List'
                });

                var countryField = form.addField({
                    id: 'custpage_selectcountry',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Country',
                    container: 'main'
                });
                countryField.addSelectOption({value: '', text: 'Select a country'});
                countryField.addSelectOption({value: 'india', text: 'India'});
                countryField.addSelectOption({value: 'china', text: 'China'});
                countryField.addSelectOption({value: 'japan', text: 'Japan'});
                countryField.isMandatory = true;

                // var sublist = form.addSublist({
                //     id: 'custpage_sublist',
                //     type: serverWidget.SublistType.LIST,
                //     label: 'Universities'
                // });
                // sublist.addField({
                //     id: 'custpage_country',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Country'
                // });
                // sublist.addField({
                //     id: 'custpage_name',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Name'
                // });
                // sublist.addField({
                //     id: 'custpage_state',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'State/Province'
                // });
                // sublist.addField({
                //     id: 'custpage_webpage',
                //     type: serverWidget.FieldType.URL,
                //     label: 'Web Pages'
                // });

                form.addSubmitButton({
                    label: 'Search University'
                });

                scriptContext.response.writePage(form);
            } else if (scriptContext.request.method === 'POST') {
                var request = scriptContext.request;
                var selectedCountry = request.parameters.custpage_selectcountry;

                var endPointUrl = 'http://universities.hipolabs.com/search?country=' + selectedCountry;
                var response = http.get({
                    url: endPointUrl
                });

                var universities = JSON.parse(response.body);

                var form = serverWidget.createForm({
                    title: 'University List'
                });
                var sublist = form.addSublist({
                    id: 'custpage_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Universities'
                });
                sublist.addField({
                    id: 'custpage_country',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Country'
                });
                sublist.addField({
                    id: 'custpage_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Name'
                });
                sublist.addField({
                    id: 'custpage_state',
                    type: serverWidget.FieldType.TEXT,
                    label: 'State/Province'
                });
                sublist.addField({
                    id: 'custpage_webpage',
                    type: serverWidget.FieldType.URL,
                    label: 'Web Pages'
                });

                universities.forEach(function(university, index) {
                    sublist.setSublistValue({
                        id: 'custpage_country',
                        line: index,
                        value: university.country
                    });
                    sublist.setSublistValue({
                        id: 'custpage_name',
                        line: index,
                        value: university.name
                    });
                    sublist.setSublistValue({
                        id: 'custpage_state',
                        line: index,
                        value: university['state-province'] || 'N/A'
                    });
                    sublist.setSublistValue({
                        id: 'custpage_webpage',
                        line: index,
                        value: university.web_pages[0]
                    });
                });

                scriptContext.response.writePage(form);
            }
        }

        return {onRequest}

    });
