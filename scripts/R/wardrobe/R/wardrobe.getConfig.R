wardrobe.getConfig <-
function (){
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
