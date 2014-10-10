#ifndef _iaintersect_
#define _iaintersect_


#include <config.hpp>

#ifndef FSTM
#define FSTM IAIntersect
#endif

struct Annotation {
        QString chrom;
        QChar strand;
        int exonCount;
        QStringList exonStarts;
        QStringList exonEnds;
        QString name;
        QString name2;
        qint64 txStart;
        qint64 txEnd;
        Annotation(){};
        Annotation(QString c,
                   QChar s,
                   int ec,
                   QStringList eS,
                   QStringList eE,
                   QString n,
                   QString n2,
                   qint64 txS,
                   qint64 txE):
            chrom(c),
            strand(s),
            exonCount(ec),
            exonStarts(eS),
            exonEnds(eE),
            name(n),
            name2(n2),
            txStart(txS),
            txEnd(txE){};

};

//class AnnotationCounter
//{
//public:
//    AnnotationCounter():_sum(0),_count(0){}
//    AnnotationCounter(annotationPtr):_sum(sum),_count(1){}

//    int sum()const  {return _sum;}
//    int count()const{return _count;}

//    counted_sum& operator += (const counted_sum& right)
//    { _sum += right.sum(); _count += right.count(); return *this; }

//private:
//    int _sum;
//    int _count;
//};

//bool operator == (const counted_sum& left, const counted_sum& right)
//{ return left.sum()==right.sum() && left.count()==right.count(); }


typedef qint64 t_genome_coordinates;
typedef QSharedPointer<Annotation> annotationPtr;
//, bicl::partial_absorber, less, bicl::inplace_max
typedef bicl::split_interval_map<t_genome_coordinates,QSet< annotationPtr > > chrom_coverage;

class IAIntersect: public QObject
{
        Q_OBJECT
    private:
        quint64 promoter,upstream;
        QString db_name;
        QString an_tbl;
        QString tbl_name;

        QSqlError sqlErr;
        QSqlQuery q;


        QMap<QString, chrom_coverage > annotation;
        void getRecordInfo();
        void fillUpAnnotation();
    public slots:
        void start(void);

    signals:
        void finished(void);

    public:


        IAIntersect(QObject* parent=0);
        ~IAIntersect();
};

//template <class T>
//bool operator<=(QList<T> &s, QList<T> &s1) {
// return s.size()<=s1.size();
//}

//template <class T>
//bool operator>=(QList<T> &s, QList<T> &s1) {
// return s.size()>=s1.size();
//}

#endif
