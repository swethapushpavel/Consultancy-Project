let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let pageSchema=new Schema({
    pageUrl: String,
    pageNavText: String,
    pageTitle: String,
    pageMetaDescription: String, // camelCase
  pageMetaKeyword: String, 
    pageHeading: String,
    pagePhoto: String, // Add this field for the file upload
    pageDetails: String
});
let pageModel=mongoose.model('pageTable1',pageSchema);
module.exports=pageModel;