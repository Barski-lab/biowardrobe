#include <ReadsCounting.hpp>
#include <Threads.hpp>

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
FSTM::FSTM(QObject *parent):
 QObject(parent)
 {
     m_ThreadCount=0;
 }

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
FSTM::~FSTM()
 {
 }

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
void FSTM::start()
 {  
     QStringList bam_names=gArgs().split("in",',');
     int num_bam=bam_names.size();
     m_ThreadNum=num_bam;
     isoforms=new IsoformsOnChromosome* [num_bam];
     sam_data=new gen_lines* [num_bam];
     threads =new sam_reader_thread* [num_bam];

     //int* dublicates=new int [num_bam];

     FillUpData();

     for(int i=0;i<num_bam;i++)
     {
         threads[i]=new sam_reader_thread(bam_names[i],sam_data[i],isoforms[i]);
         connect(threads[i],SIGNAL(finished()),this,SLOT(ThreadCount()));
         connect(threads[i],SIGNAL(terminated()),this,SLOT(ThreadCount()));
     }

     //for(int i=0; i<num_bam; i++)
     //{
     //    qDebug()<<bam_names.at(i)<<" ("<<i<<")";
     //    qDebug()<<"Total chromosomes:"<<isoforms[i][0].size();
     //    foreach(const QString key,isoforms[i][0].keys())
     //    {
     //        qDebug()<<"Total isos in chr("<<key<<") size:"<<isoforms[i][0][key].size();
     //    }
     //}
     
     StartingThreads();
     WriteResult();
 }//end func
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
 void FSTM::FillUpData()
 {  
     QString sql_str;
     sql_str="select name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2 from refGene where chrom not like '%\\_%'";
     //sql_str="select CONCAT_WS(',',CONCAT('\\\"',refsec,'\\\"'),CONCAT('\\\"',gene,'\\\"'),CONCAT('\\\"',CONVERT(txStart,CHAR),'\\\"')) as name,gene as name2,chrom,strand,txStart,txStart as txEnd from expirements.RNASEQ_CD4_CUFFLINKS";
     if(!q.exec(sql_str))
     {
         qDebug()<<"Query error: "<<q.lastError().text();
         emit finished();
     }
     //int tot_isoforms=q.size()+1;

     for(int i=0;i<m_ThreadNum;i++)
     {
         isoforms[i]=new IsoformsOnChromosome ();
         //if(tot_isoforms!=-1)
         //    isoforms[i]->reserve(tot_isoforms);
         sam_data[i]=new gen_lines();
         //dublicates[i]=0;
     }


     int fieldExCount = q.record().indexOf("exonCount");
     int fieldExStarts = q.record().indexOf("exonStarts");
     int fieldExEnds = q.record().indexOf("exonEnds");
     int fieldName = q.record().indexOf("name");
     int fieldName2 = q.record().indexOf("name2");
     int fieldChrom = q.record().indexOf("chrom");
     int fieldStrand = q.record().indexOf("strand");
//     int fieldTxStart= q.record().indexOf("txStart");
//     int fieldTxEnd= q.record().indexOf("txEnd");

//     int frame=gArgs().getArgs("window").toInt();
     while(q.next())
     {
         //-------------------------------------------
         // If counting exons
         //-------------------------------------------
         if(1)
         {
             /*
              Preparing data arrays for multi threading calculation
              each data set for each thread
             */
             for(int i=0;i<m_ThreadNum;i++)
             {
                 /*exon start positions*/
                 QStringList q_starts=q.value(fieldExStarts).toString().split(QChar(','));
                 /*exon end positions*/
                 QStringList q_ends=q.value(fieldExEnds).toString().split(QChar(','));
                 /*exon count*/
                 int exCount=q.value(fieldExCount).toInt();
                 /*exon name*/
                 /*chromosome name*/
                 QString chr=q.value(fieldChrom).toString();
                 /*iso name*/
                 QString iso_name=q.value(fieldName).toString();
                 /*gene name*/
                 QString g_name=q.value(fieldName2).toString();
                 /*Variables to store start/end exon positions*/
                 bicl::interval_map<t_genome_coordinates,t_reads_count> iso;

                 QChar strand=q.value(fieldStrand).toString().at(0);
                 quint64 len=0;
                 for(int j=0;j<exCount;j++)
                 {
                     quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
                     len+=(e-s);
                     iso.add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s,e),1));
                 }

                 QSharedPointer<Isoform> p(   new Isoform(iso_name,g_name,chr,strand,iso,len)   );
                 isoforms[i][0][chr].append( p );
             }
         }
//         //-------------------------------------------
//         // If counting around TSS
//         //-------------------------------------------
//         if(0)
//         {
//
//             QString key=q.value(fieldName).toString();
//             int tssStart=q.value(fieldTxStart).toInt();
//             int tssEnd=q.value(fieldTxEnd).toInt();
//             int exCount=1;
//             quint64 len=frame*2;
//             if(strand=='+')
//             {
//                 ExSt<<tssStart-frame;
//                 ExEn<<tssStart+frame;
//             }
//             else if(strand == '-')
//             {
//                 ExSt<<tssEnd-frame;
//                 ExEn<<tssEnd+frame;
//             }
//             else
//             {
//                 qDebug()<<"Unknown strand:"<<strand;
//             }
//             if(refsec.contains(key))
//             {
//                 key=key+QString("_%1").arg(++dublicates);
//             }
//             refsec.insert(key,
//                 Isoform (
//                 q.value(fieldName2).toString(),
//                 q.value(fieldChrom).toString(),
//                 q.value(fieldStrand).toChar(),
//                 exCount,
//                 ExSt,
//                 ExEn,
//                 len)
//                 );
//         }
     }

/*
do intersections !!!
*/
     foreach(const QString key, isoforms[0][0].keys())
     {
         for(int i=0; i<isoforms[0][0][key].size();i++)
         {
             for(int i=0; i<isoforms[0][0][key].size();i++)
             {

             }
         }
     }
 }
 
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
 void FSTM::StartingThreads()
 {  
     int max_thr=gArgs().getArgs("threads").toInt();
     if(QThread::idealThreadCount()!=-1)
     {
         max_thr=QThread::idealThreadCount()-1;
         qDebug()<<"idealThreadCount:"<<max_thr;
     }

     for(int i=0; i<m_ThreadNum;i++)
     {
         while(m_ThreadCount>=max_thr)
         {
             QCoreApplication::processEvents();
             sleep(10);
         }

         m_ThreadCount++;
         threads[i]->start();
     }

     while(m_ThreadCount!=0)
     {
         QCoreApplication::processEvents();
         sleep(10);
     }
//     QTimer::singleShot(10, this, SLOT(WriteResult()));
 }
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

 void FSTM::ThreadCount()
 {  
     m_ThreadCount--;
     qDebug()<<"Thread count:"<<m_ThreadCount;
 }
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

 void FSTM::WriteResult()
 {  

     qDebug()<<" Writing a result";
     QFile _outFile;
     _outFile.setFileName(gArgs().getArgs("out").toString());
     _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
//     _outFile.write((QString("%1\n").arg(sam_data.total-sam_data.notAligned)).toAscii());
//
//     foreach(const QString key,isoforms[0]->keys())
     foreach(const QString chr,isoforms[0][0].keys())
     {
         for(int c=0; c<isoforms[0][0][chr].size(); c++)
         {
             for(int i=0;i<m_ThreadNum;i++)
             {
                 QSharedPointer<Isoform> current = isoforms[i][0][chr][c];
                 //         if(current.totReads!=0)
                 {
                     if(i==0)
                     {
                         _outFile.write((QString("\"%1\",\"%2\",%3").arg(current.data()->name).arg(current.data()->name2).arg(current.data()->RPKM)).toAscii());
                     }
                     else
                     {
                         _outFile.write((QString(",%1").arg(current.data()->RPKM)).toAscii());
                     }
                 }
             }
             _outFile.write(QString("\n").toAscii());
         }

     }
     _outFile.close();
     qDebug()<<"Complete";
     emit finished();
 }
 //------------------------------------------------------------------------------------
 //------------------------------------------------------------------------------------
