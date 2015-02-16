#setClass("Wardrobe", representation(result="data.frame"))

wardrobe <- function(id, lazzy=T) UseMethod("wardrobe")

wardrobe.default<-function(id, lazzy=T){
  if(missing(id)) {
    message("Please specify at least one id or uid")    
    return;
  }
  config<-wardrobe.getConfig()
  settings<-wardrobe.getSettings()
  ides<-c(id)
  data<-list()
  c<-0
  for(i in ides) {
    c<-c+1
    if(lazzy) {
    d<-wardrobe.getPreliminary(i,settings)
      if(is.null(d)) {
        #load advanced
        d<-wardrobe.getAdvanced(i,settings)
      }
    } else { #force advanced
      d<-wardrobe.getAdvanced(i,settings)
    }
    if(is.null(d)) {
      c<-c-1
      next
    }
    if(c == 1) {data<-list(d)} else {data[c]<-list(d)}
  }
  return(data);
}

wardrobe.getConfig<-function (){
  config<-list(user="readonly",password="readonly",dbname="ems",host="localhost")
    
  outCatch <- tryCatch(
  {
    f=file("/etc/wardrobe/wardrobe",open="r")
    lines=readLines(f)
    pos<-0
    for (i in 1:length(lines)){      
      if(grepl("^(\ *)#|^(\ *)$", lines[i])) { next }
      pos<-pos+1
      if(pos==1){
        config$host=lines[i]
      }else if(pos==2){
        config$user=lines[i]        
      }else if(pos==3){
        config$password=lines[i]                
      }else if(pos==4){
        config$dbname=lines[i]                
      }
    }
    close(f)
    return(config)
  },
  error=function(cond) {
    return(config)
  },
  warning=function(cond) {
    return(config)
  }
)    
}

wardrobe.getSettings<-function (){
  library("RMySQL")
  config<-wardrobe.getConfig()
  con <- dbConnect(dbDriver("MySQL"), 
                   user=config$user, 
                   password=config$password,
                   dbname=config$dbname,
                   host=config$host,
                   client.flag = CLIENT_MULTI_STATEMENTS) 
  set<-dbGetQuery(con,paste("select `key`,`value` from settings",sep=""))
  dbDisconnect(con)
  wardrobe_p<-paste(set[set$key=="wardrobe",][2])

  settings<-list(
    wardrobe=wardrobe_p,
    preliminary=paste(wardrobe_p,'/',set[set$key=="preliminary",][2],sep=""),
    temp=paste(wardrobe_p,'/',set[set$key=="temp",][2],sep=""),
    maxthreads=as.integer(paste(set[set$key=="maxthreads",][2],sep="")),
    experimentsdb=paste(set[set$key=="experimentsdb",][2])
  )
return(settings)
}

wardrobe.getPreliminary<-function (id="",settings=""){
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
  library("RMySQL")
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


wardrobe.getAdvanced<-function (uid="",settings=""){
  #if(nchar(uid)!=36)
  #  return(paste("Error with uid:",uid,' l:',nchar(uid)))
  
  library("RMySQL")
  config<-wardrobe.getConfig()
  con <- dbConnect(dbDriver("MySQL"), 
                   user=config$user, 
                   password=config$password,
                   dbname=config$dbname,
                   host=config$host,
                   client.flag = CLIENT_MULTI_STATEMENTS) 
  uid<-dbEscapeStrings(con, uid)
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
