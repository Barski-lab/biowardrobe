wardrobe.getSettings <-
function (){
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
