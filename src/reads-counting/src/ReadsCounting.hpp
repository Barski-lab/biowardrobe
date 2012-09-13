#ifndef _ReadsCounting_
#define _ReadsCounting_


#include <config.hpp>

typedef unsigned int t_genome_coordinates;
typedef unsigned int t_reads_count;

struct Isoform
{
    QString name;
    QString name2;
    QString chrom;
    QChar strand;
    int exCount;
    bicl::interval_map<t_genome_coordinates,t_reads_count> isoform;
    quint64 len;
    quint64 totReads;
    float RPKM;
    bool testNeeded;
    bool intersects;

    Isoform():
    exCount(0),
    len(0),
    RPKM(0){};

    Isoform(QString n,QString n2,QString chr,QChar s,bicl::interval_map<t_genome_coordinates,t_reads_count> iso,quint64 l):
    name(n),
    name2(n2),
    chrom(chr),
    strand(s),
    exCount(iso.size()),
    isoform(iso),
    len(l),
    totReads(0),
    RPKM(0),
    testNeeded(false),
    intersects(false){};
};

typedef QSharedPointer<Isoform> IsoformPtr;
typedef QVector< IsoformPtr > refsec;
typedef QMap<QString, refsec> IsoformsOnChromosome;

#include <Reads.hpp>
typedef genome::GenomeDescription gen_lines;

//-------------------------------------------------------------------------------------------------------
#define FSTM ReadsCounting

class sam_reader_thread;

class FSTM: public QObject
{
    Q_OBJECT

private:
    int m_ThreadCount;
    int m_ThreadNum;
    QSqlQuery q;

    IsoformsOnChromosome** isoforms;
    gen_lines** sam_data;
    sam_reader_thread** threads;
    
public:

    FSTM(QObject* parent=0);
    ~FSTM();  

public slots:
    void start(void);

protected slots:

    void ThreadCount(void);
    void FillUpData(void);
    void StartingThreads(void);
    void WriteResult(void);

signals:
    void finished(void);
};

#endif
