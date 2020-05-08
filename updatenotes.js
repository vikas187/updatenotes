var isDate = function(date) {
    return (date.length > 10 && Number(date.substring(5,7)) !== 0 && Number(date.substring(8,10)) !==0 && Number(date.substring(0,4)) !==0) ? true : false;
};


function main(type) {
    // PUT YOUR CODE HERE
    
    var attributes = [
        {
            name:"update_custom",
            value:"1"
        }
    ];
    var rec = NSOA.form.getNewRecord();
    NSOA.meta.log('debug', "Triggering the reciept script on reciept record" + rec.id);

    try {
        var recId = rec.id;
        var envelopeId = rec.envelopeid;
        var userId = rec.userid;
        var category = rec.categoryid;
        var categoryName = rec.description; 
        var startDate = ''; //rec.expense_workshop_start__c;
        var endDate = '';   //rec.expense_workshop_end__c; 
        var taskId = rec.project_taskid; //project_taskid

        var userName='' ;
        var user = new NSOA.record.oaUser();
        user.id = userId;
        //getting user name
        var userReadRequest = {
                type : "User",
                method : "equal to", 
                fields : "name", // specify fields to be returned
                attributes : [ 
                    {
                        name : "limit",
                        value : "1"
                    }
                ],
            objects : [ 
                user
            ]
        };

        var userResults = NSOA.wsapi.read(userReadRequest);
        if(userResults[0].objects !== null)
        {
            userName = userResults[0].objects[0].name;
        }
        NSOA.meta.log("debug",' Category Name:'+categoryName+" User Name: "+userName);
        var task = new NSOA.record.oaProjecttask();
        task.id =  taskId;

        //getting dates from projecttask
        var readRequest = {
                type : "Projecttask",
                method : "equal to", 
                fields : "id, early_finish, calculated_starts,early_start,starts,fnlt_date", // specify fields to be returned
                attributes : [ 
                    {
                        name : "limit",
                        value : "1"
                    }
                ],
            objects : [ 
                task
            ]
        };

        var results = NSOA.wsapi.read(readRequest);
        if(results[0].objects !== null)
        {

            startDate = results[0].objects[0].calculated_starts;
            if(isDate(startDate)) {
                noteStartDate = startDate.substring(5,7) +'-' + startDate.substring(8,10) + '-'+ startDate.substring(0,4);
            } else {
                noteStartDate = "";
            }
            endDate = results[0].objects[0].fnlt_date;
            if(isDate(endDate)) {
                noteEndDate = endDate.substring(5,7) +'-' + endDate.substring(8,10) + '-'+ endDate.substring(0,4);
            } else {
                noteEndDate = "";
            }
            NSOA.meta.log("error",' StartDate:'+startDate+' EndDate:'+endDate);
        }

        var update = new NSOA.record.oaTicket();
        var envelope = new NSOA.record.oaEnvelope();
        update.id = recId;
        update.expense_workshop_start__c = startDate;
        update.expense_workshop_end__c = endDate;
        update.notes = categoryName.length ? (categoryName +": ") : "" + userName + "  Start Date: "+noteStartDate+"  End Date: "+noteEndDate;
        envelope.id = envelopeId;
        envelope.notes = update.notes;
        var finalResults = NSOA.wsapi.modify(attributes, [update]);
        var envelopeResults = NSOA.wsapi.modify(attributes, [envelope]);

        if(finalResults[0].status=="U") {
                NSOA.meta.log("info","Update Successful");
        }
        else {
            NSOA.meta.log("error","Update Err: "+finalResults[0].errors[0].code);
        }
    
        if(envelopeResults[0].status=="U") {
                NSOA.meta.log("info","Envelope Update Successful");
        }
        else {
            NSOA.meta.log("error","Envelope Update Err: "+envelopeResults[0].errors[0].code);
        }
    } catch(ex) {
        NSOA.meta.log("error", ex);
    }
 
   
    
    
}