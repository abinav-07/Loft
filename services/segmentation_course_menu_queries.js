//Database Connection
const { reject, update } = require("lodash");
const { resolve } = require("promise");
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
                    //Checking If User is Already Inrolled
                    const check_user_data_sql = `Select * FROM segmentation_course_menu_detail 
                                            WHERE
                                            user_id=${req.body.user_id}                                            
                                            `;
                    pool.query(check_user_data_sql, async (check_user_err, check_user_result) => {
                        if (check_user_err) {
                            res.status(400).send(check_user_err);
                        }

                        if (check_user_result && !check_user_result.length > 0) {
                            //Insert If User Has No data in Database
                            await insertIntoSegmentationCourse(req.body.user_id, "menu", 1);
                            await insertIntoSegmentationCourse(req.body.user_id, "sub_menu", 1, 1);
                            return resolve(result);
                        } else {
                            return resolve(result);
                        }

                    })

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

        const segmentation_course_menu_user_details = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_menu_detail 
                        WHERE
                        user_id=${req.body.user_id}
                        `;
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
        })

        const segmentation_course_sub_menu_user_details = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_sub_menu_detail 
                        WHERE
                        user_id=${req.body.user_id}
                        `;
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
        })


        const segmentation_course_sub_sub_menu_user_details = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM segmentation_course_sub_sub_menu_detail 
                        WHERE
                        user_id=${req.body.user_id}
                        `;
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
        })

        //New Object For Menus
        let segmentation_course_menu_details = {};
        segmentation_course_menu_details["user_id"] = req.body.user_id;
        segmentation_course_menu_details["menu"] = [];

        if (segmentation_course_menu && segmentation_course_menu.length > 0) {
            for (var i = 0; i < segmentation_course_menu.length; i++) {
                var newObject = {
                    menu_id: segmentation_course_menu[i]["menu_id"],
                    menu_title: segmentation_course_menu[i]["menu_title"],
                    total_duration: segmentation_course_menu[i]["totalDuration"],
                    sub_menu: []
                }
                segmentation_course_menu_details["menu"].push(newObject);
            }
        }

        //New Object For Sub Menu
        if (segmentation_course_sub_menu && segmentation_course_sub_menu.length > 0) {
            for (var i = 0; i < segmentation_course_sub_menu.length; i++) {
                var newSubObject = {
                    sub_menu_id: segmentation_course_sub_menu[i]["sub_menu_id"],
                    sub_menu_title: segmentation_course_sub_menu[i]["sub_menu_title"],
                    total_duration: segmentation_course_sub_menu[i]["totalDuration"],
                    sub_sub_menu: []
                }
                segmentation_course_menu_details["menu"].filter((menu, index) => {
                    if (menu.menu_id === segmentation_course_sub_menu[i]["menu_id"]) {
                        segmentation_course_menu_details["menu"][index]["sub_menu"].push(newSubObject);
                    }
                }
                );
            }
        }

        //New Object For Sub-Sub Menu
        if (segmentation_course_sub_sub_menu && segmentation_course_sub_sub_menu.length > 0) {
            for (var i = 0; i < segmentation_course_sub_sub_menu.length; i++) {
                var newSubSubObject = {
                    sub_sub_menu_id: segmentation_course_sub_sub_menu[i]["sub_sub_menu_id"],
                    sub_sub_menu_title: segmentation_course_sub_sub_menu[i]["sub_sub_menu_title"],
                    total_duration: segmentation_course_sub_sub_menu[i]["totalDuration"]
                }
                segmentation_course_menu_details["menu"].filter((menu, menuindex) => {
                    menu["sub_menu"].filter((submenu, submenuindex) => {

                        if (submenu.sub_menu_id === segmentation_course_sub_sub_menu[i]["sub_menu_id"]) {
                            segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["sub_sub_menu"].push(newSubSubObject);
                        }
                    })
                }
                );

            }
        }

        //Adding User Details to Course Menu        
        if (segmentation_course_menu_user_details && segmentation_course_menu_user_details.length > 0) {
            for (var i = 0; i < segmentation_course_menu_user_details.length; i++) {
                segmentation_course_menu_details["menu"].filter((menu, index) => {

                    if (menu.menu_id === segmentation_course_menu_user_details[i]["menu_id"]) {
                        segmentation_course_menu_details["menu"][index]["is_active"] = segmentation_course_menu_user_details[i]["is_active"];
                    } else {
                        segmentation_course_menu_details["menu"][index]["is_active"] = "0";
                    }
                })
            }
        }

        if (segmentation_course_sub_menu_user_details && segmentation_course_sub_menu_user_details.length > 0) {
            for (var i = 0; i < segmentation_course_sub_menu_user_details.length; i++) {
                segmentation_course_menu_details["menu"].filter((menu, menuindex) => {
                    menu["sub_menu"].filter((submenu, submenuindex) => {
                        if (submenu.sub_menu_id === segmentation_course_sub_menu_user_details[i]["sub_menu_id"]) {
                            segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["is_active"] = segmentation_course_sub_menu_user_details[i]["is_active"];
                            segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["status"] = segmentation_course_sub_menu_user_details[i]["status"];
                        } else {
                            segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["is_active"] = "0";
                            segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["status"] = "";
                        }
                    })
                })
            }
        }

        if (segmentation_course_sub_sub_menu_user_details && segmentation_course_sub_sub_menu_user_details.length > 0) {
            for (var i = 0; i < segmentation_course_sub_sub_menu_user_details.length; i++) {
                segmentation_course_menu_details["menu"].filter((menu, menuindex) => {
                    menu["sub_menu"].filter((submenu, submenuindex) => {
                        if (submenu["sub_sub_menu"] && submenu["sub_sub_menu"].length > 0) {
                            submenu["sub_sub_menu"].filter((subsubmenu, subsubmenuindex) => {
                                if (subsubmenu.sub_sub_menu_id === segmentation_course_sub_sub_menu_user_details[i]["sub_sub_menu_id"]) {
                                    segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["sub_sub_menu"][subsubmenuindex]["is_active"] = segmentation_course_sub_sub_menu_user_details[i]["is_active"];
                                    segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["sub_sub_menu"][subsubmenuindex]["status"] = segmentation_course_sub_sub_menu_user_details[i]["status"];
                                } else {
                                    segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["sub_sub_menu"][subsubmenuindex]["is_active"] = "0";
                                    segmentation_course_menu_details["menu"][menuindex]["sub_menu"][submenuindex]["sub_sub_menu"][subsubmenuindex]["status"] = "";
                                }
                            })
                        }
                    })
                })
            }
        }



        res.status(200).send(segmentation_course_menu_details);
    } else {
        res.status(400).send("User Id Not Found");
    }
}

//Update Course Details
const updateSegmentationCourseUserDetail =  async (req, res) => {
    if(req.body.user_id && req.body.menu_id ){
       const value= await updateSegmentationCourseUserFunction(req.body.user_id,req.body.menu_id,req.body.sub_menu_id,req.body.sub_sub_menu_id);
       
       if(value=="OK"){
           res.status(200).send("Updated");
       }else{
           res.status(400).send("Error");
       }
    }else{
        res.status(400).send("User Id/Menu Id not found");
    }
    
}


const updateSegmentationCourseUserFunction = async (user_id, menu_id, sub_menu_id = null, sub_sub_menu_id = null, duration = 0) => {//User ID, Menu Type, Menu_Type Primary Key,Duration For menu
    let menuPromise,subMenuPromise,subSubMenuPromise
    if (menu_id) {
       menuPromise= await new Promise((resolve, reject) => {
            let check_user_data_sql = `SELECT * FROM segmentation_course_menu_detail 
                            WHERE user_id=${user_id} AND menu_id=${menu_id}                    
        `;
            pool.query(check_user_data_sql, async (err, result) => {
                if (err) {
                    console.log(err)
                }
                let sql;
                if (result && result.length > 0) {
                    sql=`UPDATE segmentation_course_menu_detail 
                        set is_active=0
                        WHERE 
                        user_id=${user_id} AND NOT menu_id=${menu_id}
                    `
                    
                    resolve(sql);
                }else if(result && !result.length > 0){
                    sql=`INSERT INTO segmentation_course_menu_detail
                        (user_id,menu_id,is_active) 
                        VALUES (${user_id},${menu_id},1);
                    `;
                    await new Promise((resolve1,reject1)=>{
                        pool.query(sql,(err1,result)=>{
                            if(err1){
                                console.log(err1);
                            }
                            let updateSql=`UPDATE segmentation_course_menu_detail 
                            set is_active=0
                            WHERE 
                            user_id=${user_id} AND NOT menu_id=${menu_id}
                            `
                            
                            resolve(updateSql);
                        })
                    })                                  
                }
            })
        }).then(async (value)=>{
            console.log(value);
            return await new Promise((resolve1,reject)=>{
                pool.query(value,(err,result)=>{
                    if(err){
                        console.log(err);
                        resolve1("Error");
                    }
                    
                    resolve1("OK");            
                })
            })
        });

    }
    if (sub_menu_id) {
        subMenuPromise= await new Promise((resolve, reject) => {
            let check_user_data_sql = `SELECT * FROM segmentation_course_sub_menu_detail 
                            WHERE user_id=${user_id} AND sub_menu_id=${sub_menu_id}                    
        `;
            pool.query(check_user_data_sql, async (err, result) => {
                if (err) {
                    console.log(err)
                }
                let sql;
                if (result && result.length > 0) {
                    sql=`UPDATE segmentation_course_sub_menu_detail 
                        set is_active=0
                        AND status="completed"
                        WHERE 
                        user_id=${user_id} AND NOT sub_menu_id=${sub_menu_id}
                    `
                    resolve(sql);
                }else if(result && !result.length > 0){
                    sql=`INSERT INTO segmentation_course_sub_menu_detail
                        (user_id,sub_menu_id,is_active,duration,status) 
                        VALUES (${user_id},${menu_id},1,${duration},"in progress");
                    `;
                    await new Promise ((resolve1,reject)=>{
                        pool.query(sql,(err1,result)=>{
                            if(err1){
                                console.log(err1);
                            }
                            let updateSql=`INSERT INTO segmentation_course_sub_menu_detail
                            (user_id,sub_menu_id,is_active,duration,status) 
                            VALUES (${user_id},${menu_id},1,${duration},"in progress");
                            `;
                            resolve(updateSql);
                        })
                    })
                    
                }
            })
        }).then((value)=>{            
            return pool.query(value,(err,result)=>{
                console.log(value);
                if(err){
                    console.log(err);
                    resolve("Error");
                }
                resolve("OK");
            })
        });
    }
    if (sub_sub_menu_id) {
        subSubMenuPromise= await new Promise((resolve, reject) => {
            let check_user_data_sql = `SELECT * FROM segmentation_course_sub_menu_detail 
                            WHERE user_id=${user_id} AND sub_sub_menu_id=${sub_sub_menu_id}                    
        `;
            pool.query(check_user_data_sql, (err, result) => {
                if (err) {
                    console.log(err)
                }
                let sql;
                if (result && result.length > 0) {
                    sql=`UPDATE segmentation_course_sub_sub_menu_detail 
                        set is_active=0
                        AND status="completed"
                        WHERE 
                        user_id=${user_id} AND NOT sub_sub_menu_id=${sub_sub_menu_id}
                    `
                    resolve(sql);
                }else if(result && !result.length > 0){
                    sql=`INSERT INTO segmentation_course_sub_sub_menu_detail
                        (user_id,sub_sub_menu_id,is_active,duration,status) 
                        VALUES (${user_id},${sub_sub_menu_id},1,${duration},"in progress");
                    `;
                    pool.query(sql,(err1,result)=>{
                        if(err1){
                            console.log(err1);
                        }
                        let updateSql=`INSERT INTO segmentation_course_sub_sub_menu_detail
                        (user_id,sub_sub_menu_id,is_active,duration,status) 
                        VALUES (${user_id},${sub_sub_menu_id},1,${duration},"in progress");
                        `;
                        resolve(updateSql);
                    })                    
                }
            })
        }).then((value)=>{
            pool.query(value,(err,result)=>{
                if(err){
                    console.log(err);
                }
                return ("Ok");
            })
        });
    }

    console.log(menuPromise)
    console.log(subMenuPromise)
    console.log(subSubMenuPromise)
    console.log(menuPromise && menuPromise.length>0);
    if(menuPromise && menuPromise.length > 0 ){
        return ("OK");
    }else{
        return ("Error");
    }

}


//Insert INto Segmentation Course Tables
const insertIntoSegmentationCourse = (user_id, type, menu_type_id, duration = 0) => {//User ID, Menu Type, Menu_Type Primary Key,Duration For menu
    let sql;
    if (type == "menu") {
        sql = `INSERT INTO segmentation_course_menu_detail
            (user_id,menu_id,is_active) 
            VALUES (${user_id},${menu_type_id},1)`;
    } else if (type == "sub_menu") {
        sql = `INSERT INTO segmentation_course_sub_menu_detail
            (user_id,sub_menu_id,status,is_active,duration) 
            VALUES (${user_id},${menu_type_id},"in progress",1,${duration})`;
    } else if (type == "sub_sub_menu") {
        sql = `INSERT INTO segmentation_course_sub_sub_menu_detail
            (user_id,sub_sub_menu_id,status,is_active,duration) 
            VALUES (${user_id},${menu_type_id},"in progress",1,${duration})`;
    }
    return new Promise((resolve, reject) => {
        pool.query(sql, (err, result) => {
            if (err) {
                console.log(err);

            }
            if (result && result.length > 0) {
                return resolve(result);
            } else {
                return resolve();
            }
        });
    });


}

module.exports = {
    getSegmentationCourseMenu,
    updateSegmentationCourseUserDetail
}