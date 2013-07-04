args <- commandArgs(trailingOnly = TRUE)

library(RMySQL)
con <- dbConnect(MySQL(), user=args[3], password=args[4],dbname=args[5],host=args[6])
res<-dbGetQuery(con,paste("select concentration,TOT_R_0,RPKM_0 from ems.spikeinslist e2,
 experiments.",args[1]," e where e2.name=e.refseq_id and e.chrom='control' and spikeins_id=",args[2]))

s<-3
model<-lm(res[,1]~res[,s])
cor<-cor.test(res[,1],res[,s])

#plot(res[,1]~res[,s],main="Scatterplot",ylab="concentration",xlab="data")
#abline(model,col="blue")

#cat("max spike=",max(res[,1]),"\n")
#cat("max x=",max(res[,s]),"\n")
print(model$coefficients[1])
print(model$coefficients[2])
print(cor$estimate)
