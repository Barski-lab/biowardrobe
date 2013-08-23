args <- commandArgs(trailingOnly = TRUE)

#$CMD = "Rscript DESeqN.R $db_user $db_pass $db_name_experiments $db_host $db_name_ems " . $tablepairs[$i]['t1'] . " " . $tablepairs[$i]['t2'] . " $rtypeid $TNAME $atypeid";
#                           args[1]  args[2]                                                                                                          8       9      10

library(DBI)
library(RMySQL)
DESeqA=1
if(args[10]==3)
    DESeqA=2

if(DESeqA==2) {
    library(DESeq2)
} else {
    library(DESeq)
}

DRV <- dbDriver("MySQL")
con <- dbConnect(DRV, user=args[1], password=args[2],dbname=args[3],host=args[4],client.flag = CLIENT_MULTI_STATEMENTS) #MySQL()
EMS<-args[5]
T1<-args[6]
T2<-args[7]
RTYPE<-args[8]

T1T<-dbGetQuery(con,paste("select tableName,name from ",EMS,".genelist where leaf=1 and (parent_id like '",T1,"' or id like '",T1,"')",sep=""))
T2T<-dbGetQuery(con,paste("select tableName,name from ",EMS,".genelist where leaf=1 and (parent_id like '",T2,"' or id like '",T2,"')",sep=""))

T1C<-dim(T1T)[1]
T2C<-dim(T2T)[1]

tblEnd="";
print(RTYPE)
if(RTYPE=="2")
  tblEnd="_genes";
if(RTYPE=="3")
  tblEnd="_common_tss";


condition<-c(rep("untreated",T1C),rep("treated",T2C))
DF<-data.frame(condition,row.names=c(paste("R_u",1:T1C,sep=""),paste("R_t",1:T2C,sep="")))
DF$condition <- factor(DF$condition,levels=c("untreated","treated"))

names<-c()

for(i in 1:T1C) {
  tblName<-paste(T1T[i,1],tblEnd,sep="")
  names<-append(names,c(paste("R_u",i,sep=""),paste("RPKM_u",i,sep="")))
  if( i==1 ) {
    fullData<-dbGetQuery(con,paste("SELECT refseq_id,gene_id,chrom,txStart,txEnd,strand,TOT_R_0 as R_u",i,",RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep=""))
  }
  if(i>1) {
    fullData<-cbind(fullData,dbGetQuery(con,paste("SELECT TOT_R_0 as R_u",i,",RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep="")))
  }
}

for(i in 1:T2C) {
  tblName<-paste(T2T[i,1],tblEnd,sep="")
  names<-append(names,c(paste("R_t",i,sep=""),paste("RPKM_t",i,sep="")))
  fullData<-cbind(fullData,dbGetQuery(con,paste("SELECT TOT_R_0 as R_t",i,",RPKM_0 from ",tblName," where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep="")))
}

if(T1C==1) {
  tblName<-paste(T1T[1,1],tblEnd,sep="")
  T1NAME<-T1T[1,2]
  T1RPKM<-dbGetQuery(con,paste("SELECT RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep=""))
} else {
  T1Th<-dbGetQuery(con,paste("select tableName,name from ",EMS,".genelist where leaf=0 and id like '",T1,"'",sep=""))
  tblName<-paste(T1Th[1,1],tblEnd,sep="")
  T1NAME<-T1Th[1,2]
  T1RPKM<-dbGetQuery(con,paste("SELECT RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep=""))
}

if(T2C==1) {
  tblName<-paste(T2T[1,1],tblEnd,sep="")
  T2NAME<-T2T[1,2]
  T2RPKM<-dbGetQuery(con,paste("SELECT RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep=""))
} else {
  T2Th<-dbGetQuery(con,paste("select tableName,name from ",EMS,".genelist where leaf=0 and id like '",T2,"'",sep=""))
  tblName<-paste(T2Th[1,1],tblEnd,sep="")
  T2NAME<-T2Th[1,2]
  T2RPKM<-dbGetQuery(con,paste("SELECT RPKM_0 from `",tblName,"` where chrom not like 'control' order by chrom,txStart,txEnd,strand,refseq_id",sep=""))
}

colnames(fullData)<-c("refseq_id","gene_id","chrom","txStart","txEnd","strand",names)


dataDimention <- dim(fullData)[2]
totReadsIndex<-seq(7,dataDimention,2)
totRPKMIndex<-seq(8,dataDimention,2)

if(DESeqA==2) {
    #dse<-DESeqDataSetFromMatrix(countData=data.matrix(data.frame(fullData[,totReadsIndex],row.names=paste(fullData[,1],1:dim(fullData)[1]))),colData=DF,design =~condition)
    dse<-DESeqDataSetFromMatrix(countData=fullData[,totReadsIndex],colData=DF,design =~condition)

    if(T1C==1|T2C==1) {
        dsq <- DESeq(dse,fitType="local")
    } else {
        dsq <- DESeq(dse)
    }

    DESeqRes<-as.data.frame(results(dsq)[,c(2,4,5)])
    DESeqRes$log2FoldChange[is.na(DESeqRes$log2FoldChange)]<-0;
    DESeqRes[is.na(DESeqRes)]<-1;
} else {
    cds <- newCountDataSet( fullData[,totReadsIndex] , condition)
    cdsF <- estimateSizeFactors( cds )

    if(T1C==1|T2C==1) {
        cdsD <- estimateDispersions( cdsF ,method="blind",sharingMode="fit-only",fitType="local")
    } else {
        cdsD <- estimateDispersions( cdsF )
    }

    DESeqRes <- nbinomTest( cdsD, "untreated", "treated" )
    isinfl<-is.infinite(DESeqRes$log2FoldChange)
    DESeqRes$log2FoldChange[isinfl]<- log2((DESeqRes$baseMeanB[isinfl]+0.1)/(DESeqRes$baseMeanA[isinfl]+0.1))
    DESeqRes <-DESeqRes[,c(6,7,8)]
    DESeqRes$log2FoldChange[is.na(DESeqRes$log2FoldChange)]<-0;
    DESeqRes[is.na(DESeqRes)]<-1;
}

final<-data.frame(cbind(fullData[,c(1:6)],T1RPKM,T2RPKM,DESeqRes),check.names=F,check.rows=F)
colnames(final)<-c("refseq_id","gene_id","chrom","txStart","txEnd","strand",paste("RPKM",T1NAME),paste("RPKM",T2NAME),"LOGR","pvalue","padj")
#write.csv( final, file=paste("/tmp/DESeq_result_",args[9],".csv",sep="") )
dbWriteTable(con, args[9], data.frame(final,check.names=F,check.rows=F),overwrite=T,row.names=F)

dbDisconnect(con)
