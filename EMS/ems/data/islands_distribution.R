# INFO:
# DATE: 1.19.2014.
# AUTH: Masashi Yukawa
######
###order of priority for definition of domain
###promoter: TSS+-2kb > Exon > Intron > upstream: TSS-20kb~+2kb >Intergenic Region
# ------------------------------------------- #
# loads libraries
times<-proc.time()
library(RMySQL)
library(RColorBrewer)
library(GenomicRanges)

args <- commandArgs(trailingOnly = TRUE)

ID<-args[1]
PROMOTER<-2000

#######load annotation data
con <- dbConnect(MySQL(), user="readonly", password="readonly", dbname="ems", host="localhost")   #connection to database.

FN_AND_DB<- dbGetQuery(con,paste("select filename,db from ems.labdata l,ems.genome g where l.genome_id=g.id and l.id=", ID, ";", sep=""))   #get filename of ID
FILENAME<-FN_AND_DB[1]
DBN<-FN_AND_DB[2]

mainQuery<-dbGetQuery(con,paste("select * from ",DBN,".refGene where chrom not like '%\\_%' order by chrom,txStart;",sep="")) #データベースへのアクセスができているのでそれをdbGetQuery関数でデータベースのknown geneというテーブルを取得。*は全ての列を示していると思う。
                      
TSS_Table <- mainQuery
TSS_GRangesP = GRanges(seqnames=TSS_Table[TSS_Table[,"strand"]=="+","chrom"], ranges = IRanges(start = TSS_Table[TSS_Table[,"strand"]=="+","txStart"]-PROMOTER, end=TSS_Table[TSS_Table[,"strand"]=="+","txStart"]+PROMOTER))    #pick up TSS+-2kb
TSS_GRangesN = GRanges(seqnames=TSS_Table[TSS_Table[,"strand"]=="-","chrom"], ranges = IRanges(start = TSS_Table[TSS_Table[,"strand"]=="-","txEnd"]-PROMOTER, end=TSS_Table[TSS_Table[,"strand"]=="-","txEnd"]+PROMOTER))    #pick up TSS+-2kb
TSS_GRanges <- reduce(append(TSS_GRangesP,TSS_GRangesN))
                      
#######Isolation of Exon
###Exon = RNA total length - TSS+-2kb
#start and end position
ExonStart <- unlist(lapply(mainQuery[, "exonStarts"], function(x)as.numeric(strsplit(x, "[,]")[[1]])))
ExonEnd <- unlist(lapply(mainQuery[, "exonEnds"], function(x)as.numeric(strsplit(x, "[,]")[[1]])))
#chr name
NRow<-dim(mainQuery)[1]
ExonChr<-c()
ExonChr<-unlist(sapply(c(1:NRow), function(x) rep(mainQuery[x, "chrom"], TSS_Table[x, "exonCount"])))
#ExonChr = unlist(sapply(mainQuery[,"name"], function(x)rep(mainQuery[, "chrom"][mainQuery[,"name"] == x], TSS_Table[, "exonCount"][mainQuery[,"name"] == x])))
                      
Exon_GRanges = GRanges(seqnames=ExonChr, ranges = IRanges(start = ExonStart, end= ExonEnd))    #GRanges for Exon
Exon_GRanges = reduce(Exon_GRanges)
                      
#TSS+-2kbとExonのとでdisjoinで切る。そこからTSS+-2kbとoverlapするものを除去する。
TSS_Exon = disjoin(c(TSS_GRanges, Exon_GRanges))
                      
overlaps = as.matrix(findOverlaps(TSS_Exon, TSS_GRanges, ignore.strand = T))   #find exon region which overlap TSS region
Exon_Granges.2 = TSS_Exon[-overlaps[ ,1]] #exclude exon region which overlap TSS region
                      
                      
#######Isolation of introns
###RNA total length-TSS+-2kb-Exon=intron
total_length_GRanges = GRanges(seqnames = mainQuery[ ,"chrom"], ranges = IRanges(start = mainQuery[ ,"txStart"], end = mainQuery[ ,"txEnd"]))
total_length_GRanges = reduce(total_length_GRanges)
                      #TSS+-2kbとExonを合わせたのとでtotal RNA lengthをdisjoinで切る。そこからTSS+-2kbとexonとを合わせたものでoverlapするものを除去する。
total_intron = disjoin(c(total_length_GRanges, c(TSS_GRanges, Exon_Granges.2)))
overlaps = as.matrix(findOverlaps(total_intron, c(TSS_GRanges, Exon_Granges.2), ignore.strand = T))  #find intron region which overlap other regions
Intron_Granges.2 = total_intron[-overlaps[ ,1]]   #exclude intron region which overlap other regions
                      
                      
#######Isolation of upstream regions (TSS-2kb~-20kb)
Upstream_Table <-mainQuery # = StartStrandMaker(mainQuery)
                      
Upstream_Table[Upstream_Table$strand == "+", ]$txEnd = Upstream_Table[Upstream_Table$strand == "+", ]$txStart - PROMOTER
Upstream_Table[Upstream_Table$strand == "+", ]$txStart = Upstream_Table[Upstream_Table$strand == "+", ]$txStart - 20000   #tssから上流-2kと-20kのpositionを格納。
Upstream_Table[Upstream_Table$strand == "-", ]$txStart = Upstream_Table[Upstream_Table$strand == "-", ]$txEnd + PROMOTER
Upstream_Table[Upstream_Table$strand == "-", ]$txEnd = Upstream_Table[Upstream_Table$strand == "-", ]$txEnd + 20000

                      #染色体をはみ出して-になってしまったgeneには1を格納。
                      #input "1" into the start or end column if their value are <1
if(length(Upstream_Table[Upstream_Table$txStart < 1, ]$txStart))
  Upstream_Table[Upstream_Table$txStart < 1, ]$txStart = 1
if(length(Upstream_Table[Upstream_Table$txEnd < 1, ]$txEnd))
  Upstream_Table[Upstream_Table$txEnd < 1, ]$txEnd = 1
                      
                      
Upstream.GRanges = GRanges(seqnames = Upstream_Table[ ,"chrom"], ranges = IRanges(start = Upstream_Table[ ,"txStart"], end = Upstream_Table[ ,"txEnd"]))
Upstream.GRanges = reduce(Upstream.GRanges)
Upstream_overlap = disjoin(c(Upstream.GRanges, c(TSS_GRanges, Exon_Granges.2, Intron_Granges.2)))
overlaps = as.matrix(findOverlaps(Upstream_overlap, c(TSS_GRanges, Exon_Granges.2, Intron_Granges.2), ignore.strand = T))
                      
Upstream_Granges.2 = Upstream_overlap[-overlaps[ ,1]]   #exclude upstream region which overlap other regions
                      
#######load island data
island<-dbGetQuery(con,paste("select * from experiments.", FILENAME, "_macs;", sep=""))
                      
#find midpoint of island
#island.midpoint = ceiling((island$start + island$end)/2)
                      
#Island_GRanges = GRanges(seqnames = island[ ,"chrom"], ranges = IRanges(start = island.midpoint, end = island.midpoint))   #GRanges for island data
Island_GRanges = GRanges(seqnames = island[ ,"chrom"], ranges = IRanges(start = island$start, end = island$end))   #GRanges for island data

#examine each island overlapping domains below
overlaps.island_TSS = as.matrix(findOverlaps(Island_GRanges, TSS_GRanges, ignore.strand = T))
num.TSS = nrow(overlaps.island_TSS)
overlaps.island_Exon = as.matrix(findOverlaps(Island_GRanges, Exon_Granges.2, ignore.strand = T))
num.Exon = nrow(overlaps.island_Exon)
overlaps.island_Intron = as.matrix(findOverlaps(Island_GRanges, Intron_Granges.2, ignore.strand = T))
num.Intron = nrow(overlaps.island_Intron)
overlaps.island_Upstream = as.matrix(findOverlaps(Island_GRanges, Upstream_Granges.2, ignore.strand = T))
num.Upstream = nrow(overlaps.island_Upstream)
                      
#island overlapping intergenic region is region which doesn't overlap above domains.
num.Intergenic = length(Island_GRanges) - num.TSS - num.Exon - num.Intron - num.Upstream
                      
#calculate percent of each island and make vector for column graph
#column.vector = c(num.Upstream, num.TSS, num.Exon, num.Intron, num.Intergenic)
cat(num.Upstream,"\n",num.TSS,"\n",num.Exon,"\n",num.Intron,"\n",num.Intergenic,sep="")

#names(column.vector) = c("Upstream", "Promoter", "Exon", "Intron", "Intergenic")
#column.vector_percent = 100*column.vector/sum(column.vector)
                      
#column.matrix_percent = apply(column.matrix, 1, function(x)x*100/sum(x)) #とっておく

runtime<-proc.time()-times
#print(runtime)
