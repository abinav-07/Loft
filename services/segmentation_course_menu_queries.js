//Database Connection
const pool = require("../config/pool");

const getSegmentationCourseMenu = async (req, res) => {
    
    if (req.body.user_id) {
        const segmentation_course_menu = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_menu`;

            pool.query(sql, (err, result) => {
                if (err) {
                    res.status(400).send(err);
                }
                if (result && result.length > 0) {
                    return resolve(result);
                } else {
                    return resolve();
                }
            })
        });

        const segmentation_course_sub_menu = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_sub_menu`;
            pool.query(sql, (err, result) => {
                if (err) {
                    res.status(400).send(err);
                }
                if (result && result.length > 0) {
                    return resolve(result);
                } else {
                    return resolve();
                }
            });

        })

        const segmentation_course_sub_sub_menu = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_sub_sub_menu`;
            pool.query(sql, (err, result) => {
                if (err) {
                    res.status(400).send(err);
                }
                if (result && result.length > 0) {
                    return resolve(result);
                } else {
                    return resolve();
                }
            });
        })
        
        //New Object For Menus
        let segmentation_course_menu_details={};
        segmentation_course_menu_details["user_id"]=req.body.user_id;  
        segmentation_course_menu_details["menu"]=[];        

        if(segmentation_course_menu && segmentation_course_menu.length>0){
            for(var i=0;i< segmentation_course_menu.length;i++){
                var newObject={
                    menu_id:segmentation_course_menu[i]["menu_id"],
                    menu_title:segmentation_course_menu[i]["menu_title"],
                    totalDuration:segmentation_course_menu[i]["totalDuration"],
                    subMenu:[]
                }
                segmentation_course_menu_details["menu"].push(newObject);
            }      
        }
        
        //New Object For Sub Menu
        if(segmentation_course_sub_menu && segmentation_course_sub_menu.length>0){
            for(var i=0;i< segmentation_course_sub_menu.length;i++){
                var newSubObject={
                    sub_menu_id:segmentation_course_sub_menu[i]["sub_menu_id"],
                    sub_menu_title:segmentation_course_sub_menu[i]["sub_menu_title"],
                    totalDuration:segmentation_course_sub_menu[i]["totalDuration"],
                    subSubMenu:[]
                }
                segmentation_course_menu_details["menu"].filter((menu,index)=>{
                        if(menu.menu_id===segmentation_course_sub_menu[i]["menu_id"]){
                            segmentation_course_menu_details["menu"][index]["subMenu"].push(newSubObject);
                        }
                    }                
                );                   
            }
        }            
        
        //New Object For Sub-Sub Menu
        if(segmentation_course_sub_sub_menu && segmentation_course_sub_sub_menu.length>0){
            for(var i=0;i<segmentation_course_sub_sub_menu.length;i++){
                var newSubSubObject={
                    sub_sub_menu_id:segmentation_course_sub_sub_menu[i]["sub_sub_menu_id"],
                    sub_sub_menu_title:segmentation_course_sub_sub_menu[i]["sub_sub_menu_title"],
                    totalDuration:segmentation_course_sub_sub_menu[i]["totalDuration"]
                }
                segmentation_course_menu_details["menu"].filter((menu,menuindex)=>{
                    menu["subMenu"].filter((submenu,submenuindex)=>{
                        
                        if(submenu.sub_menu_id===segmentation_course_sub_sub_menu[i]["sub_menu_id"]){                            
                             segmentation_course_menu_details["menu"][menuindex]["subMenu"][submenuindex]["subSubMenu"].push(newSubSubObject);
                        }
                    })
                }                
            );
                    
            }
        }
        

        

        res.status(200).send(segmentation_course_menu_details);
    } else {
        res.status(400).send("User Id Not Found");
    }
}

const updateSegmentationCourseUserDetail=(req,res)=>{
    
}

module.exports = {
    getSegmentationCourseMenu,
    updateSegmentationCourseUserDetail
}