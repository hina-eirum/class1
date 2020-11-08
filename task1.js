var information ={ info :
    [
        {Name: "Alia" , fName : "Khan" , rollNo : 1 , class : "SSC I" , lastClass : "SSCII" ,lastPassingMarks : 40 },
        {Name: "Sara" , fName : "Abid" , rollNo : 2 , class : "SSC I" , lastClass : "SSCII" ,lastPassingMarks : 50 },
        {Name: "farhan" , fName : "Nasir" , rollNo : 3 , class : "SSC I" , lastClass : "SSCII" ,lastPassingMarks : 60 },
        {Name: "Nazia" , fName : "Ali" , rollNo : 4 , class : "SSC I" , lastClass : "SSCII" ,lastPassingMarks : 38 },
        {Name: "Ahad" , fName : "Hasan" , rollNo : 5 , class : "SSC I" , lastClass : "SSCII" ,lastPassingMarks : 65 }
    ]
}
var data = information
for (var i = 0; i < data.length; i++){
    var newdata = data [i];
    if ( newdata ["name" == 'Alia']) {
        console.log(newdata);
    }
}
// var feeStructure = [[AdmissionFee = 12000] , [MonthlyFee = 10000 ] , [ExtraCurriculumFee = 500]]
// var total = feeStructure[0]+[1]+[2]
// var feeStructure = ["Admission-fees" , "Monthly-fees" , "Extra-Curriculum-fees"]
// var Amount = [12000 , 10000 , 500]
// var a = {
//     "Admission-fees" : 12000 ,
//     "Monthly-fees" : 10000 ,
//     "Extra-Curriculum-fees" : 500
// };
// var total = []
// // for (var i = 0; i < total.length; i++){
// //     var grandTotal = total [i];
// //}
// for (total in a){ 
// console.log(total[a])}
