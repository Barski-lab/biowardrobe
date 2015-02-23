require(compiler)
wardrobe.RNACoverage <- function (exp) {
  plt_len<-200
  dummy<-rep(0,plt_len+1)
  if(!exp$isRNA) return(dummy)
  if(!file.exists(exp$bamfile)) return(dummy)
  library("Rsamtools",quietly=T,verbose=F)
  library("RMySQL",quietly=T,verbose=F)
  library("GenomicAlignments",quietly=T,verbose=F)
  library("BiocParallel",quietly=T,verbose=F)
  
  config<-wardrobe.getConfig()
  con <- dbConnect(dbDriver("MySQL"), 
                   user=config$user, 
                   password=config$password,
                   dbname=config$dbname,
                   host=config$host,
                   client.flag = CLIENT_MULTI_STATEMENTS)
  
  is_ranges<-dbGetQuery(
    con,paste("
              SELECT r.chrom,r.txStart,r.txEnd,r.name,0,r.strand,cdsStart,cdsEnd,0,exonCount,exonStarts,exonEnds 
              FROM ",exp$db,".",exp$annotation," r, experiments.`",exp$uid,"_isoforms` a
              WHERE
              r.chrom=a.chrom AND a.strand=r.strand AND r.txStart=a.txStart-1 AND r.txEnd=a.txEnd AND a.refseq_id=r.name    
              AND a.RPKM_0>10 AND r.txEnd-r.txStart>1000               
              ",sep=""))
  dbDisconnect(con)
  # AND a.strand='+'
  # ORDER BY a.RPKM_0 DESC limit 1000
  is_count<-length(is_ranges$exonCount)
  if(is_count<5)
    return(dummy)

  namesl<-list()
  irl<-list()
  
  for(i in seq_len(is_count) ) {
    #i<-1
    st<-as.numeric(strsplit(is_ranges$exonStarts[i],',')[[1]])
    en<-as.numeric(strsplit(is_ranges$exonEnds[i],',')[[1]])               
    names<-paste0(rep(is_ranges$chrom[i],is_ranges$exonCount[i]),":",st,"-",en)
    ir<-IRanges(start=st,end=en, names=names)
    metadata(ir)<-list(strand=is_ranges$strand[i])
    namesl<-append(namesl,is_ranges$chrom[i])
    irl<-append(irl,list(ir))
  }
  
  what <- c("pos","strand")
  which <- RangesList(irl)
  names(which)<-namesl 
  
  flags<-scanBamFlag(isProperPair = (exp$isPair == 1),isUnmappedQuery = F, hasUnmappedMate = F,isFirstMateRead = (exp$isPair == 1))
  param <- ScanBamParam(which=which, what=what,flag=flags)
  #system.time(
  bam <- scanBam(exp$bamfile, index=exp$bamfile, param=param)
  #)
  
  cov<-bplapply(irl,function(ir) {
  #for(ir in irl) {
    #i<-1
    #ir<-irl[[100]]
    genewidth<-sum(width(ir))
    bin<-genewidth/plt_len  
    cov<-c(rep(0,plt_len+1))  
    for(i in seq_len(length(ir))) {      
      abs_pos<-0
      idx<-1
      cwidth<-0
      # Strand specificity  
      if(exp$isDUTP) {
        strand<-"+"
        if(metadata(ir)$strand == "+")
          strand<-"-"
        tmp1<-rle(bam[[names(ir)[i]]]$pos[bam[[names(ir)[i]]]$strand==strand])
        #tmp1<-rle(bam[[names(ir)[i]]]$pos)
      } else {
        tmp1<-rle(bam[[names(ir)[i]]]$pos)
      }
      
      for(j in seq_len(length(tmp1$lengths))) {
        pos<-tmp1$values[j]
        if(pos>end(ir)[idx]) {
          cwidth<-sum(width(ir[end(ir)<pos]))
          idx<-sum(start(ir)<pos)
          
          if(idx>length(ir)) 
            break
        }
        if(pos-start(ir)[idx]+1 > width(ir)[idx]) 
          next
        abs_pos<-(pos-start(ir)[idx])+cwidth
        il<-floor(abs_pos/bin)
        #if(il>201)
        #  browser()
        cov[il+1] = cov[il+1]+tmp1$lengths[j]
      }
    }
    cov<-cov/bin
    if(metadata(ir)$strand=="+") { cov } else { rev(cov) }
  }
  ,BPPARAM = MulticoreParam(workers=detectCores()/4))

  return(Reduce("+",cov)/is_count)
}

wardrobe.RNACoverageC <- cmpfun(wardrobe.RNACoverage)


#for(i in seq_len(length(cov))) {
#  if(length(cov[[i]]) > 201)
#    print(i)
#}

#
#
#
#
#
#
#
#
#
#
wardrobe.RNACoverage.OLD <- function (exp){
if(!exp$isRNA) return()
library("Rsamtools",quietly=T,verbose=F)
library("RMySQL",quietly=T,verbose=F)
library("GenomicAlignments",quietly=T,verbose=F)

# library(BiocParallel) #load the library to enable parallel execution
# maxWorkers <- 2

config<-wardrobe.getConfig()
con <- dbConnect(dbDriver("MySQL"), 
                 user=config$user, 
                 password=config$password,
                 dbname=config$dbname,
                 host=config$host,
                 client.flag = CLIENT_MULTI_STATEMENTS)

is_ranges<-dbGetQuery(
con,paste("
  SELECT r.chrom,r.txStart,r.txEnd,r.name,0,r.strand,cdsStart,cdsEnd,0,exonCount,exonStarts,exonEnds 
  FROM ",exp$db,".",exp$annotation," r, experiments.`",exp$uid,"_isoforms` a
  WHERE
    r.chrom=a.chrom AND a.strand=r.strand AND r.txStart=a.txStart-1 AND r.txEnd=a.txEnd AND a.refseq_id=r.name    
    AND a.strand='+'
    AND a.RPKM_0>5 AND r.txEnd-r.txStart>900 
  ORDER BY a.RPKM_0 DESC limit 1000
",sep=""))
dbDisconnect(con)

#track<-paste(gsub("-", "_", exp$uid),"_wtrack",sep="")
is_count<-length(is_ranges$exonCount)

cov<-c(rep(0,201))

for(i in seq_len(is_count) ) {
  #i<-1
  ir<-IRanges(start=as.numeric(strsplit(is_ranges$exonStarts[i],',')[[1]]),
              end=as.numeric(strsplit(is_ranges$exonEnds[i],',')[[1]]))
  #which <- RangesList(ir)
  what <- c("pos","strand")
  isM<-function() {
    if((exp$isDUTP==1) & (is_ranges$strand[i] == "+")) { return(T); 
    } else if ((exp$isDUTP == 1) & (is_ranges$strand[i] == "-")){ return(F) }
    return(NA);
  }
  flags<-scanBamFlag(isProperPair = (exp$isPair == 1),isUnmappedQuery = F, hasUnmappedMate = F,
                     isMinusStrand = isM(),isFirstMateRead = (exp$isPair == 1)) #, isDuplicate = F
  
  tot_length<-sum(width(ir))
  bin<-tot_length/200  
  
  #irt<-unlist(tile(ir,w=bin))
  #which <- RangesList(irt)
  
  which <- RangesList(ir)
  metadata(which)<-list(genelength=tot_length,geneid<-paste(is_ranges$name[i],"^",i,sep=""),strand=is_ranges$strand[i])
  names(which)<-is_ranges$chrom[i]
  param <- ScanBamParam(which=which, what=what,flag=flags)

  aln3 <- readGAlignmentsFromBam(exp$bamfile,param=param)
  # bam <- scanBam(exp$bamfile, index=exp$bamfile, param=param)
  # bamr <- countBam(exp$bamfile, index=exp$bamfile, param=param)
  
  abs_pos<-0
  idx<-1
  cwidth<-0
  tmp1<-rle(sort(aln3@start))
  #system.time(
  for(j in seq_len(length(tmp1$lengths))) {
    pos<-tmp1$values[j]
    if(pos>end(ir)[idx]) {
      cwidth<-sum(width(ir[end(ir)<pos]))
      idx<-sum(start(ir)<pos)

      if(idx>length(ir)) 
        break
    }
    if(pos-start(ir)[idx] > width(ir)[idx]) 
      next
    abs_pos<-(pos-start(ir)[idx])+cwidth
    il<-floor(abs_pos/bin)
    if(il>200)
      cat(paste(">",i,">",pos,">",start(ir)[idx],">",cwidth,"\n")) #> 128821770 > 202 
    cov[il+1] = cov[il+1]+tmp1$lengths[j]
  }
  #)
  return(cov)
}
}
