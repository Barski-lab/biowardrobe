args <- commandArgs(trailingOnly = TRUE)

library(RMySQL)
con <- dbConnect(MySQL(), user=args[1], password=args[2],dbname=args[3],host=args[4])



res<-dbGetQuery(con,paste("SELECT r1.tableName,r1.rtype_id,r1.name,r2.rhead_id from ems.result r1,ems.resultintersection r2 
where r1.id=r2.result_id and r2.rhead_id in 
(select rhead_id from ems.analysis where ahead_id=",args[5],")"))

uniqGrp<-unique(res$rhead_id)
#index of grp is which(uniqGrp==res$rhead_id[i])
#colnames(test)<-test$name[1:8]

groups<-numeric(0)

for(i in 1:dim(res)[1]) {
  tblEnd="";
 if(res[i,2]==2) 
  tblEnd="_genes";
 if(res[i,2]==3) 
  tblEnd="_common_tss";

 tblName<-paste(res[i,1],tblEnd,sep="")
 origData<-dbGetQuery(con,paste("SELECT RPKM_0 from ",tblName,"order by chrom,txStart,txEnd"))
 if(i==1) {
   fullData<-origData
 }
 if(i>1) {
  fullData<-cbind(fullData,origData)
 }
 groups<-append(groups,which(uniqGrp==res$rhead_id[i]))
}

colnames(fullData)<-res$name

pcr=prcomp(fullData,cor=TRUE)
result<-cbind(pcr$rotation,groups)
result<-cbind(res$name,result)
result<-rbind(result,c("barplot",pcr$sdev,0))

dbWriteTable(con, args[6], data.frame(result,check.names=F,check.rows=F),overwrite=TRUE)

dbDisconnect(con)
