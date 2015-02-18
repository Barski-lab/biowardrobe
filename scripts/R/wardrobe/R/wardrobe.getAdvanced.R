wardrobe.getAdvanced <-
function (uid="",settings=""){
  #if(nchar(uid)!=36)
  #  return(paste("Error with uid:",uid,' l:',nchar(uid)))
  if(class(uid) == "numeric") {
   return();
  }
    print(class(uid))
  config<-wardrobe.getConfig()
  con <- dbConnect(dbDriver("MySQL"), 
                   user=config$user, 
                   password=config$password,
                   dbname=config$dbname,
                   host=config$host,
                   client.flag = CLIENT_MULTI_STATEMENTS) 
  #uid<-dbEscapeStrings(con, uid)
  sql<-sprintf("select 
    tableName, name, rtype_id,upper(author) as worker,COALESCE(fragmentsize,0) as fragmentsize,etype,COALESCE(ge.db,g.db) as db,
      ge.annottable as annotation,l.uid as uid,g.type as type from genelist g
      left join (labdata l,experimenttype e,genome ge)
     on (labdata_id=l.id and l.genome_id=ge.id and l.experimenttype_id=e.id)
     where g.name like '%%%s%%' or g.id like '%s'",uid,uid)
  set<-dbGetQuery(con,sql)

  if(dim(set)[1] == 0) {
    dbDisconnect(con)
    return()
  }
  tmp=""
  if(dim(set)[1] > 1) {
    tmp<-list(overload="")
    tmp$overload<-list(data.frame(set[,c(1,2)]))
    set<-set[1,]
  }
  
  set<-c(set,dataset="",tmp)
  sql<-paste("select * from `",settings$experimentsdb,"`.`",set$tableName,'`',sep="")
  data<-dbGetQuery(con,sql)
  set$dataset<-data.frame(data,check.names=F,check.rows=F)
    
  dbDisconnect(con)
  return(set)
}
