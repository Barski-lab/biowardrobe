\name{wardrobe}
\alias{wardrobe}
%- Also NEED an '\alias' for EACH other topic documented here.
\title{ Wardrobe function
%%  ~~function to do ... ~~
}
\description{
%%  ~~ A concise (1-5 lines) description of what the function does. ~~
}
\usage{
wardrobe(id, lazzy = T)
}

\arguments{
  \item{id}{ experiment ID from preliminary analysis.
%%     ~~Describe \code{id} here~~
}
  \item{lazzy}{ T/F - means try to find record in preliminary and advanced tables
%%     ~~Describe \code{lazzy} here~~
}
}
\details{
%%  ~~ If necessary, more details than the description above ~~
}
\value{
\item{uid}{experiment internal UID - string}
\item{isRNA}{numeric 1/0, if 1 it is a RNA-Seq experiment}
\item{fragmentsize}{numeric - ChIP-Seq library fragment size which was used in calculations}
\item{isPair}{1/0 - 1 if it is pair-end experiment}
\item{isDUTP}{1/0 - 1 if it is dUTP experiment}
\item{tagsmapped}{integer - the number of tags mapped to the reference genome}
\item{db}{string - UCSC database name mm10/hg19/rn5/xenTro3/...}
\item{annotation}{string - UCSC annotation table, for instance "refGene", one can select data from experiment$db.experiment$annotation to view an annotation for the reference genome}
\item{alias}{string - a short experiment name}
\item{bamfile}{string - whole path to the bam file}
\item{fastgz}{string - whole path to the fastq bzipped file}
RNA-Seq specific
\item{dataseti}{'data.frame' - table with RPKM values counted against isoforms}
\item{datasetg}{'data.frame' - table with RPKM values counted against genes}
\item{datasetc}{'data.frame' - table with RPKM values counted against common transcription start sites}
DNA-Seq specific
\item{dataset}{'data.frame' - MACS output table}
%%  ~Describe the value returned
%%  If it is a LIST, use
%%  \item{comp1 }{Description of 'comp1'}
%%  \item{comp2 }{Description of 'comp2'}
%% ...
}
\references{
%% ~put references to the literature/web site here ~
}
\author{
%%  ~~who you are~~
}
\note{
%%  ~~further notes~~
}

%% ~Make other sections like Warning with \section{Warning }{....} ~

\seealso{
 \code{\link[wardrobe:wardrobe-package]{wardrobe-package}}
%% ~~objects to See Also as \code{\link{help}}, ~~~
}
\examples{
\dontrun{

  library(wardrobe)  
  experiment <- wardrobe(id=1000)[[1]]
  str(experiment)
}
}
% Add one or more standard keywords, see file 'KEYWORDS' in the
% R documentation directory.
\keyword{ ~kwd1 }
\keyword{ ~kwd2 }% __ONLY ONE__ keyword per line
