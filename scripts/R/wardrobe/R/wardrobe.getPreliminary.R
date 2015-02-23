wardrobe.getPreliminary <-
function (id="",settings=""){
  sid<-0
  where=""
  if(!length(grep("[^[:digit:]]", as.character(id)))) {
    sid<-as.integer(id)
    where<-paste(" l.id =",sid)
  }else {
    if(nchar(id)!=36)
      return(paste("Error with id:",id,' l:',nchar(id)))
    sid<-id
    where<-paste(" l.uid ='",sid,"'",sep="")
  }
  config<-wardrobe.getConfig()
  con <- dbConnect(dbDriver("MySQL"), 
                   user=config$user, 
                   password=config$password,
                   dbname=config$dbname,
                   host=config$host,
                   client.flag = CLIENT_MULTI_STATEMENTS) 
    
  set<-dbGetQuery(con,paste("
   select uid,COALESCE(fragmentsize,0) as fragmentsize,
    IF(etype LIKE '%RNA%', 1, 0) as isRNA,
    IF(etype LIKE '%pair%', 1, 0) as isPair,
    IF(etype LIKE '%dUTP%', 1, 0) as isDUTP,
    l.tagsmapped,
    etype,upper(author) as author,
    ge.db as db,ge.annottable as annotation, name4browser as alias 
    from labdata l
    left join (experimenttype e,genome ge)
    on (l.genome_id=ge.id and l.experimenttype_id=e.id)
    where ",where,sep=""))

  if(dim(set)[1] != 1) {
    dbDisconnect(con)
    return()
  }
  
  set<-c(set,
         bamfile=paste(settings$preliminary,'/',set$uid,'/',set$uid,'.bam',sep=""),
         fastgz=paste(settings$preliminary,'/',set$uid,'/',set$uid,'.fastgz',sep="")
         )
  
  sql<-""
  if(set$isRNA == 1) {
    set<-c(set,dataseti="",datasetg="",datasetc="")

    sql<-paste("select * from `",settings$experimentsdb,"`.`",set$uid,"_isoforms`",sep="")
    data<-dbGetQuery(con,sql)
    set$dataseti<-data.frame(data,check.names=F,check.rows=F)

    sql<-paste("select * from `",settings$experimentsdb,"`.`",set$uid,"_genes`",sep="")
    data<-dbGetQuery(con,sql)
    set$datasetg<-data.frame(data,check.names=F,check.rows=F)

    sql<-paste("select * from `",settings$experimentsdb,"`.`",set$uid,"_common_tss`",sep="")
    data<-dbGetQuery(con,sql)
    set$datasetc<-data.frame(data,check.names=F,check.rows=F)
  } else {
    sql<-paste("select * from `",settings$experimentsdb,"`.`",set$uid,"_islands`",sep="")
    data<-dbGetQuery(con,sql)
    set<-c(set,dataset="")
    set$dataset<-data.frame(data,check.names=F,check.rows=F)
  }
  dbDisconnect(con)
  return(set)
}
