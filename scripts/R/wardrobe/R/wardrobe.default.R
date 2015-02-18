wardrobe.default <-
function(id, lazzy=T){
  if(missing(id)) {
    message("Please specify at least one id or uid")    
    return;
  }
  config<-wardrobe.getConfig()

  suppressMessages(library("DBI"))
  suppressMessages(library("RMySQL"))
  
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
