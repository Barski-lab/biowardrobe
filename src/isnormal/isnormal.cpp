

#include "isnormal.hpp"


FSTM::FSTM(QObject *parent):
 QThread(parent)
 {
 }

FSTM::~FSTM()
 {
 }


void FSTM::DB()
{
  if(!setup.contains("SQL/DRIVER"))
      setup.setValue("SQL/DRIVER","QMYSQL");
  if(!setup.contains("SQL/DBNAME"))
      setup.setValue("SQL/DBNAME","hg18");
  if(!setup.contains("SQL/HOST"))
      setup.setValue("SQL/HOST","10.0.2.2");
  if(!setup.contains("SQL/PORT"))
      setup.setValue("SQL/PORT",3306);
  if(!setup.contains("SQL/USER"))
      setup.setValue("SQL/USER","root");    
  if(!setup.contains("SQL/PASS"))
      setup.setValue("SQL/PASS",qCompress("").toBase64());

  if (!QSqlDatabase::drivers().contains(setup.value("SQL/DRIVER").toString()))
	{
	 qDebug()<<"No SQL driver. Drivers list:"<<QSqlDatabase::drivers();
	 throw 1;
	}
  else
	{
     db = QSqlDatabase::addDatabase(setup.value("SQL/DRIVER").toString());
     db.setDatabaseName(setup.value("SQL/DBNAME").toString());
     db.setHostName(setup.value("SQL/HOST").toString());
     db.setPort(setup.value("SQL/PORT").toInt());
     if (!db.open(setup.value("SQL/USER").toString(),
         qUncompress(QByteArray::fromBase64(setup.value("SQL/PASS").toByteArray())) ) ) 
	  {
        sqlErr = db.lastError();
        qDebug()<<qPrintable(tr("Error connect to DB:")+sqlErr.text());
        throw 1;
      }      
     }
}



#define QUERIES(a,b) \
  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_##b; \
  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_##b; \
  \
  if(!q.exec(setup.value(a).toString())) \
    { \
      sqlErr = q.lastError(); \
	  qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); \
    } \
  if(q.record().indexOf("exonStarts")>=0)  \
  {\
   if(q.record().count()==4) \
   { \
   while (q.next())  \
    {                \
     QStringList list1 = q.value(1).toString().split(",", QString::SkipEmptyParts); \
     QStringList list2 = q.value(2).toString().split(",", QString::SkipEmptyParts); \
     assert(list1.size()==list2.size()); \
     QList<QString> tmp; tmp+=q.value(3).toString();\
     for(int __i=0;__i<list2.size();__i++) \
      { \
       chr_intervals_map_##b [q.value(0).toString()].add(make_pair(bicl::discrete_interval<int>::closed(list1.at(__i).toInt(),list2.at(__i).toInt()),tmp)); \
      }\
    } \
   }/*if recourd count equal 4*/\
   else \
   { \
   while (q.next())  \
    {                \
     QStringList list1 = q.value(1).toString().split(",", QString::SkipEmptyParts); \
     QStringList list2 = q.value(2).toString().split(",", QString::SkipEmptyParts); \
     assert(list1.size()==list2.size()); \
     for(int __i=0;__i<list2.size();__i++) \
      { \
       chr_intervals_##b [q.value(0).toString()]+=bicl::discrete_interval<int>::closed(list1.at(__i).toInt(),list2.at(__i).toInt()); \
      }\
    } \
   } \
  }/*if record count has index*/ \
  else \
  {\
   if(q.record().count()==4) \
   { \
   while (q.next())  \
    {                \
     QList<QString> tmp; tmp+=q.value(3).toString();\
     chr_intervals_map_##b [q.value(0).toString()].add(make_pair(bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()),tmp)); \
    } \
   }\
   else \
   { \
   while (q.next())  \
     {                \
      if(!intersects(chr_intervals_##b [q.value(0).toString()],bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()))) \
      {\
       chr_intervals_##b [q.value(0).toString()]+=bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()); \
       total_rows++; \
      }\
     } \
   }\
  }



    //chr_intervals[chr]=chr_intervals_1[chr] - chr_intervals_2[chr];
#define UNIQUE_A_B(a,b,c) \
    bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
    bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    bool _checking_=true; \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = (*__it1); \
      bicl::discrete_interval<int> __itv2  = (*__it2); \
 \
/*      qDebug()<<"itv1.l="<<__itv1.lower()<<" itv1.u="<<__itv1.upper();*/ \
/*      qDebug()<<"itv2.l="<<__itv2.lower()<<" itv2.u="<<__itv2.upper();*/ \
      if(__itv1.upper()>__itv2.upper()) \
      { \
       if(intersects(__itv1,__itv2)) _checking_=false; \
       __it2++; \
/*      qDebug()<<"next --------------------------------------------"; */\
      } \
      else \
      { \
/*      qDebug()<<"intersect"<<intersects(__itv1,__itv2);*/ \
       if(!intersects(__itv1,__itv2) && _checking_) \
        { \
         c+=__itv1; \
        } \
        _checking_=true; \
       __it1++; \
      } \
    } 


#define INTERSECT_A_B(a,b,c) \
    bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
    bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = (*__it1); \
      bicl::discrete_interval<int> __itv2  = (*__it2); \
 \
      if(intersects(__itv1,__itv2)) \
       { \
         c+=__itv1; \
         c+=__itv2; \
       } \
\
      if(__itv1.upper()>__itv2.upper()) \
       { \
        __it2++; \
       } \
      else \
       { \
        __it1++; \
       } \
    } 

//QMap<QString,bicl::interval_map<int,QList<QString> > > percentile_result_##c; 
/*
        left=((left-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;               
        right=((right-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;             
        left=(left-__itv2.lower());               \
        right=(right-__itv2.lower());             \
        if(right>5000 || right>5000) \
        {                             \
      qDebug()<<"itv1.l="<<__itv1.lower()<<" itv1.u="<<__itv1.upper(); \
      qDebug()<<"itv2.l="<<__itv2.lower()<<" itv2.u="<<__itv2.upper(); \
      qDebug()<<"l="<<left<<" right="<<right; \
        }                               \
*/

#define INTERSECT_PERCENTILE_A_B(a,b,c) \
    bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
    bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = (*__it1); \
      bicl::discrete_interval<int> __itv2  = (*__it2); \
 \
      if(intersects(__itv1,__itv2)) \
       { \
        int left=__itv1.lower();                                                                \
        int right=__itv1.upper();                                                               \
        if(left<__itv2.lower()) left=__itv2.lower();                                            \
        if(right>__itv2.upper()) right=__itv2.upper();                                           \
                                                                                                \
        left=((left-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;               \
        right=((right-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;             \
        c.add(make_pair(bicl::discrete_interval<int>::closed(left,right),1) ); \
       } \
\
      if(__itv1.upper()>__itv2.upper()) \
       { \
        __it2++; \
       } \
      else \
       { \
        __it1++; \
       } \
    } 

#define INTERSECT_W_MAP_A_B(a,b,c) \
    bicl::interval_map<int,QList<QString> >::const_iterator __it1 = a.begin(); \
    bicl::interval_map<int,QList<QString> >::const_iterator __it2 = b.begin(); \
\
    /*removing all intersection from first that exist in second*/ \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = __it1->first; \
      bicl::discrete_interval<int> __itv2  = __it2->first; \
\
      if(intersects(__itv1,__itv2)) \
       { \
         c.add(make_pair(__it2->first,__it1->second)); \
         c.add(make_pair(__it2->first,__it2->second)); \
       } \
\
      if(__itv1.upper()>__itv2.upper()) \
       { \
        __it2++; \
       } \
      else \
       { \
        __it1++; \
       } \
    } 


//This function looking for unique Segments in A, which are exist in A and have no intersections with segments in B
#define UNIQUE_W_MAP_A_B(a,b,c) \
    bicl::interval_map<int,QList<QString> >::const_iterator __it1 = a.begin(); \
    bicl::interval_map<int,QList<QString> >::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    bool _checking_=true; \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = __it1->first; \
      bicl::discrete_interval<int> __itv2  = __it2->first; \
 \
      if(__itv1.upper()>__itv2.upper()) \
      { \
       if(intersects(__itv1,__itv2)) _checking_=false; \
       __it2++; \
      } \
      else \
      { \
       if(!intersects(__itv1,__itv2) && _checking_) \
        { \
         c.add(make_pair(__it1->first,__it1->second)); \
        } \
        _checking_=true; \
       __it1++; \
      } \
    } 


#define PRINT(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_##b.keys()) \
   {                                          \
                                               \
    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals_##b[chr].begin(); it != chr_intervals_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = (*it);                                                                                                 \
      \
      _outFile.write( QString("%1\t%2\t%3\n").                                                                                                     \
         arg(chr).arg(itv.lower()).arg(itv.upper()).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();


#define PRINT1(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_map_##b.keys()) \
   {                                          \
                                               \
    for(bicl::interval_map<int,QList<QString> >::const_iterator it = chr_intervals_map_##b[chr].begin(); it != chr_intervals_map_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = it->first;                                                                                                 \
      QList<QString> tmp=it->second;                                                                                                                   \
      \
      QString _str=tmp.first(); \
      \
       for(int kk=1;kk<tmp.size();kk++) _str+=","+tmp.value(kk);                                                                                     \
      _outFile.write( QString("%1\t%2\t%3\t%4\n").                                                                                                     \
         arg(chr).arg(itv.lower()).arg(itv.upper()).arg(_str).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();


#define PRINT_W_Q(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_map_##b.keys()) \
   {                                          \
    for(bicl::interval_map<int,QList<QString> >::const_iterator it = chr_intervals_map_##b[chr].begin(); it != chr_intervals_map_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = (*it).first;                                                                                                 \
      QList<QString> tmp=it->second;                                                                                                                   \
      QString _str,gene; \
      _str=tmp.first()+"\t";                                                                                                                             \
       for(int kk=1;kk<tmp.size() && kk<2;kk++) {_str+=tmp.value(kk)+QString("\t%1\t").arg(tmp.size()-1);gene=tmp.value(kk);}                            \
        if(!q.exec(QString(setup.value("QUERIES/Q_EXPRESSION").toString()).arg(gene).arg(gene))) \
         { \
              sqlErr = q.lastError(); \
	      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); \
         } \
                   \
        while (q.next())  \
         {                \
             _str+=q.value(1).toString()+"\t"+q.value(2).toString()+"\t"+q.value(3).toString()+"\t"+q.value(4).toString()+"\t"; \
         } \
               \
         _outFile.write( QString("%1\t%2\t%3\t%4\n").                                                                                                     \
             arg(chr).arg(itv.lower()).arg(itv.upper()).arg(_str).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();

/*       QString QUER="select 1,sample_1,sample_2,max(value_1),max(value_2) from expirements.TSS_NaiveCD4Rna_seqPRE where sample_1=0 and gene_id=\"%1\" group by sample_2 \
UNION ALL                                                                                                                                    \
select 2,sample_1,sample_2,max(value_1),max(value_2) from expirements.TSS_TEMCD4Rna_seqPRE where sample_1=0 and gene_id=\"%2\" group by sample_2";                   \*/


void FSTM::run()
 {
//  separate_interval_set<int> uniq_interval;
//  discrete_interval<int> inter_val;

  QList<double> l1;
  QList<double> l2;
//  float abundances1;
//  float abundances2;
  
  DB();
  QSqlQuery q("", db);
  
  QMap<int,int> map;  
  QFile _outFile;
  int i=0;
  double total_rows=0;
#define IsNORMAL_
#ifdef IsNORMAL_
/*
  sam_reader_thread *srt1=new sam_reader_thread(&sam_data1,"1.bam");
  srt1->start();
  sam_reader_thread *srt2=new sam_reader_thread(&sam_data2,"2.bam");
  srt2->start();
*/
  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_0;//SQL
  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_00;//SQL
//  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_0;//SQL
//  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_00;//SQL


//  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_1;//SQL
//  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_2;//SQL

/*
  if(!q.exec(setup.value("QUERIES/COUNT").toString()))
    { 
      sqlErr = q.lastError();
	  qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text());
    } 
*/
  
  QUERIES("QUERIES/Q1",1);//fill in chr_intervals
//  QUERIES("QUERIES/Q2",2);//fill in (in addition to Q1) chr_intervals format: [crhom]+=interval
qDebug()<<"query"<<setup.value("QUERIES/Q1").toString();
qDebug()<<"total rows"<<total_rows;
qDebug()<<"total rows"<<q.size();
  total_rows=0;
//  int resolution=1002;
  bicl::interval_map<int,int> percentile_result;

  if(!q.exec(setup.value("QUERIES/Q3").toString())) 
    { 
      sqlErr = q.lastError(); 
	  qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
    } 
   total_rows=q.size();
qDebug()<<"query"<<setup.value("QUERIES/Q3").toString();
qDebug()<<"total rows"<<total_rows;
qDebug()<<"total rows"<<q.size();
int tot_inter=0;
   while (q.next())
    { 
     int resolution=q.value(4).toInt();
     int seg_l,seg_r;
     if(q.value(3).toString()=="+")
     {
      seg_l=q.value(1).toInt()-resolution/2;
      seg_r=q.value(1).toInt()+resolution/2;
     }
     else
     {
      seg_l=q.value(2).toInt()-resolution/2;
      seg_r=q.value(2).toInt()+resolution/2;
     }
     
     //if current segment intersects with some segments from Q1
     if(intersects(chr_intervals_1 [q.value(0).toString()],bicl::discrete_interval<int>::closed(seg_l,seg_r)))
     {
      tot_inter++;
      bicl::separate_interval_set<int> tmp; tmp+=bicl::discrete_interval<int>::closed(seg_l,seg_r);
      tmp=chr_intervals_1[q.value(0).toString()] & tmp;

      for(bicl::separate_interval_set<int>::const_iterator it = tmp.begin(); it != tmp.end(); it++)
      {
       int left=it->lower();
       int right=it->upper();       

       if(q.value(3).toString()=="+")
       {
        left=(left-seg_l);               
        right=(right-seg_l);               
//        right=(right-q.value(1).toInt())/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;               
        percentile_result.add(make_pair(bicl::discrete_interval<int>::closed(left,right),1) );        
       }
       else
       {
//        left=( -1*(left-q.value(2).toInt())  )/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;               
//        right=( -1 *(right-q.value(2).toInt())  )/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;            
        left=( -1*(left-seg_r ));
        right=( -1 *(right-seg_r ));
        percentile_result.add(make_pair(bicl::discrete_interval<int>::closed(right,left),1) );        
       }
      } 
     }
    } 
qDebug()<<"total_intersects="<<tot_inter;    

/*
  bicl::interval_map<int,int> percentile_result;
  foreach(chr,chr_intervals_1.keys())
   {
   INTERSECT_PERCENTILE_A_B(chr_intervals_1[chr],chr_intervals_3[chr],percentile_result);
   }
*/
   _outFile.setFileName("./out_percentile_a_and_b.txt");
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); 
                                                             
    for(bicl::interval_map<int,int>::const_iterator it = percentile_result.begin(); it != percentile_result.end(); it++)
     {                                                                                                                                                 
      bicl::discrete_interval<int> itv  = it->first;                                                                                                 
      double tmp=it->second/total_rows;
      for(int i=itv.lower();i<itv.upper();i++)
      _outFile.write( QString("%1\t%2\n").                                                                                                     
         arg(i).arg(tmp).toLocal8Bit() );
     }
   _outFile.flush();
   _outFile.close();



/*
  QUERIES("QUERIES/Q3",3);//fill in (in addition to Q1) chr_intervals format: [crhom]+=interval
qDebug()<<"query"<<setup.value("QUERIES/Q3").toString();
qDebug()<<"total rows"<<total_rows;
qDebug()<<"total rows"<<q.size();
  QString chr;
  total_rows=0;
  QUERIES("QUERIES/COUNT",ZZ);//fill in chr_intervals

qDebug()<<"query"<<setup.value("QUERIES/COUNT").toString();
qDebug()<<"total rows"<<total_rows;
//  PRINT("./out_1.txt",1);
//  PRINT("./out_2.txt",2);
//  PRINT("./out_3.txt",3);
*/
/*  foreach(chr,chr_intervals_1.keys())
   {
     chr_intervals_0[chr]=chr_intervals_1[chr]+chr_intervals_2[chr];
   } 
  PRINT("./out_sum_a_and_b.txt",0);

  foreach(chr,chr_intervals_1.keys())
   {
     INTERSECT_A_B(chr_intervals_0[chr],chr_intervals_3[chr],chr_intervals_00[chr]);
   } 
  PRINT("./out_intersect_a_and_b.txt",00);
*/


/*
  foreach(chr,chr_intervals_map_1.keys())
   {
     UNIQUE_W_MAP_A_B(chr_intervals_map_1[chr],chr_intervals_map_2[chr],chr_intervals_map_0[chr]);
   } 
  PRINT1("./out_uniq_in_a.txt",0);


  foreach(chr,chr_intervals_map_0.keys())
   {
    INTERSECT_W_MAP_A_B(chr_intervals_map_0[chr],chr_intervals_map_3[chr],chr_intervals_map_00[chr]);
   }
   PRINT1("./out_uniq_intersect.txt",00);
//    PRINT_W_Q("./out_uniq_intersect.txt",00);
*/

//----------------------------------------------------------------------------------------------
//  qDebug()<<"Queries loaded, waiting threads";
/*
  srt1->wait();
  srt2->wait();


  sam_data_searcher *sds1=new sam_data_searcher(&l1,&sam_data1, &chr_intervals);
  sam_data_searcher *sds2=new sam_data_searcher(&l2,&sam_data2, &chr_intervals);
  sds1->start();
  sds2->start();
  qDebug()<<"Simaltenious start";
  sds1->wait();
  sds2->wait();
  qDebug()<<"Simaltenious end";
*/
/*   _outFile.setFileName("./out_1.txt");
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

   QString chr;
   foreach(chr,chr_intervals_1.keys())
   {

    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals_1[chr].begin(); it != chr_intervals_1[chr].end(); it++)
     {
      bicl::discrete_interval<int> itv  = (*it);
      _outFile.write( QString("%1\t%2\t%3\n").
         arg(chr).arg(itv.lower()).arg(itv.upper()).toLocal8Bit() );
      i++;
     }  
   } 
*/
/*   QString chr;
   foreach(chr,chr_intervals.keys())
   {

    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals[chr].begin(); it != chr_intervals[chr].end(); it++)
     {
      bicl::discrete_interval<int> itv  = (*it);
      _outFile.write( QString("%1\t%2\t%3\t%4\t%5\n").
         arg(chr).arg(itv.lower()).arg(itv.upper()).arg(l1[i]).arg(l2[i]).toLocal8Bit() );
//      abundances1+=l1[i]; 
      i++;
     }  
   }   */
   
//   _outFile.flush();
//   _outFile.close();





return;

   int k1=sam_data1.total-sam_data1.notAligned;
   int k2=sam_data2.total-sam_data2.notAligned;
#else
  if(!q.exec(setup.value("QUERIES/Q3").toString())) 
    { 
      sqlErr = q.lastError(); 
	  qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
    } 
       
  while (q.next())  
    {               
     if(q.value(0).toInt()==0)
     {
     l1<<1;
     }
     else
     {
     l1<<q.value(0).toInt();
     }
     if(q.value(1).toInt()==0)
     {
     l2<<1;
     }
     else
     {
     l2<<q.value(1).toInt();
     }
    }

   int k1=1;//sam_data1.total-sam_data1.notAligned;
   int k2=1;//sam_data2.total-sam_data2.notAligned;
#endif


   _outFile.setFileName("./out1.txt");
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);


   qDebug()<<"size l1:"<<l1.size();   
   qDebug()<<"size l2:"<<l2.size();   

i=0;
double mean=0.0;
double sigma=0.0;

   for(int j=0; j< l1.size(); j++)
   {
    double lg=log((l1[j]/k1)/(l2[j]/k2));
    mean+=lg;
    sigma+=lg*lg;
    map[(int)(lg*100.0)]+=1;
//    i++;
   }

   i=l1.size();
   mean/=i;
   sigma=sigma/i-mean*mean;

//   qDebug()<<"sum of all bar heights:"<<i;      
   qDebug()<<"mean eq:"<<mean;   
   qDebug()<<"sigma square eq:"<<sigma;   
   qDebug()<<"sigma eq:"<<sqrt(sigma);   

/*sigma=0;
   for(int j=0; j< l1.size(); j++)
   {
    double lg=log10((l1[j]/k1)/(l2[j]/k2));
    double sq=(lg-mean);
    sigma+=(sq*sq);
   }
   sigma/=i;
   qDebug()<<"sigma square eq:"<<sigma;   
   qDebug()<<"sigma eq:"<<sqrt(sigma);   
*/

int five_c=i*0.025;   

double left_lim=0.0;
double right_lim=0.0;
QString per_="2.5%:";

   qDebug()<<per_<<five_c;   
   qDebug()<<"size of map:"<<map.size();   
int temp_tot=0;   
   int key=0;
   foreach(key,map.keys())      
   {
      _outFile.write( QString("%1\t%2\n").
         arg((double)key/100.0).arg(map[key]).toLocal8Bit() );
     temp_tot+=map[key];
     if(temp_tot<=five_c) left_lim=key/100.0;
     if(temp_tot<=(i-five_c)) right_lim=key/100.0;
     
   }
   _outFile.flush();
   _outFile.close();

   qDebug()<<"left "<<per_<<left_lim;   
   qDebug()<<"right "<<per_<<right_lim;   


#ifdef IsNORMAL1_
   _outFile.setFileName("./out3.txt");
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
i=0;  
   foreach(chr,chr_intervals.keys())
   {

    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals[chr].begin(); it != chr_intervals[chr].end(); it++)
     {
      bicl::discrete_interval<int> itv  = (*it);
      double c_v=log2((l1[i]/k1)/(l2[i]/k2));
      int left=2;
      if( c_v > 0 ) left=1;
      if( c_v <left_lim || c_v >right_lim)
      _outFile.write( QString("%1\t%2\t%3\t%4\t%5\t%6\t%7\n").
         arg(chr).arg(itv.lower()).arg(itv.upper()).arg(l1[i]).arg(l2[i]).arg(c_v).arg(left).toLocal8Bit() );
      
      i++; 
     }  
   }   
   _outFile.flush();
   _outFile.close();
#endif






//for(separate_interval_set<int>::const_iterator it = chr_intervals["chrX"].begin(); it != chr_intervals["chrX"].end(); it++)
//    {
//        discrete_interval<int> itv  = (*it);
//        std::cout << "uniq_intervals :" << itv.lower<<"xx:"<<itv.upper << std::endl;
//    }  

  
//  s1  =new sam_reader(&sam_data1,"1.bam");
//  s1->Load();
//  s2  =new sam_reader(&sam_data2,"2.bam");
//  s2->Load();

//  cout << "uniq_intervals:" << chr_intervals["chrX"] << endl;

/*  inter_val = discrete_interval<int>::closed(4,8);
  uniq_interval+=inter_val;
  inter_val = discrete_interval<int>::closed(8,10);
  uniq_interval+=inter_val;
  inter_val = discrete_interval<int>::closed(9,12);
  uniq_interval+=inter_val;
  inter_val = discrete_interval<int>::closed(13,15);
  uniq_interval+=inter_val;
  cout << "uniq_intervals:" << uniq_interval << endl;

for(separate_interval_set<int>::const_iterator it = uniq_interval.begin(); it != uniq_interval.end(); it++)
    {
        discrete_interval<int> itv  = (*it);
        cout << "uniq_intervals xx:" << itv << endl;
    }  
//  qDebug()<<uniq_interval;
*/
  exit();
 }
