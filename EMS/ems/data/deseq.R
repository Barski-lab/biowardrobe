args <- commandArgs(trailingOnly = TRUE)


library(RMySQL)
library(DESeq)

con <- dbConnect(MySQL(), user=args[1], password=args[2],dbname=args[3],host=args[4])
ID<-args[5]


mainQuery<-dbGetQuery(con,paste("SELECT r1.tableName,r1.rtype_id,r1.name,r2.rhead_id,a.type
from ems.result r1,ems.resultintersection r2,ems.analysis a
where r1.id=r2.result_id and r2.rhead_id=a.rhead_id and a.ahead_id=",ID," order by rhead_id,r1.name"))


uniqGrp<-unique(mainQuery$rhead_id)

groups<-numeric(0)
deseqConditions<-mainQuery$type

expNum<-dim(mainQuery)[1]
names<-c()

for(i in 1:expNum) {
    tblEnd="";
    if(mainQuery[i,2]==2)
        tblEnd="_genes";
    if(mainQuery[i,2]==3)
        tblEnd="_common_tss";

    tblName<-paste(mainQuery[i,1],tblEnd,sep="")

    if( i==1 ) {
        fullData<-dbGetQuery(con,paste("SELECT refsec_id,gene_id,TOT_R_0,RPKM_0 from ",tblName,"order by chrom,txStart,txEnd"))
    }
    if(i>1) {
        fullData<-cbind(fullData,dbGetQuery(con,paste("SELECT TOT_R_0,RPKM_0 from ",tblName,"order by chrom,txStart,txEnd")))
    }
    groups<-append(groups,which(uniqGrp==mainQuery$rhead_id[i]))
    names<-append(names,c(mainQuery$name[i],paste("RPKM",mainQuery$name[i])))
}

colnames(fullData)<-c("refsec_id","gene_id",names)

E1<-sum(groups==1)
E2<-sum(groups==2)

dataDimention <- dim(fullData)[2]
totReadsIndex<-seq(3,dataDimention,2)

cds <- newCountDataSet( fullData[,totReadsIndex] , deseqConditions)
cdsF <- estimateSizeFactors( cds )

if(E1==1 | E2==1) {
    cdsD <- estimateDispersions( cdsF ,method="blind",sharingMode="fit-only")
} else {
    cdsD <- estimateDispersions( cdsF )
}

#PCA
#vsdF<-varianceStabilizingTransformation(cdsD)
#rv <- rowVars(exprs(vsdF))
#select <- order(rv, decreasing=TRUE)[seq_len(500)]
#select2 <- order(rv, decreasing=TRUE)[seq_len(5000)]
#pca <- prcomp(t(exprs(vsdF)[select,]))

#
DESeqRes <- nbinomTest( cdsD, "untreated", "treated" )

untr<-DESeqRes[,3]
trea<-DESeqRes[,4]
untr[untr<0.1] <- 0.1
trea[trea<0.1] <- 0.1

LOG2RATIO<-data.frame(log2(trea/untr))
colnames(LOG2RATIO)<-c("LOGR")

#write.csv( cbind(fullData,DESeqRes[,c(3,4,7,8)]), file=paste("DESeq_result_",ID,".csv",sep="") )
dbWriteTable(con, args[6], data.frame(cbind(fullData,DESeqRes[,c(3,4,7,8)],LOG2RATIO),check.names=F,check.rows=F),overwrite=TRUE)

dbDisconnect(con)
