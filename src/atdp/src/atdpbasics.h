#ifndef ATDPBASICS_H
#define ATDPBASICS_H

#include <config.hpp>
#include <Settings.hpp>

struct REGION {
        QString chrom;
        QString gene_id;
        QString refseq_id;
        bool strand;
        qint64 start;
        qint64 end;
        qint64 txStart;
        qint64 txEnd;
};

struct EXPERIMENT_INFO {
        int fragmentsize;
        int mapped;
        bool pair;
        QString db;
        QString source;
        QString filepath;
        QString tbl1_id;
        QString tbl2_id;
        QString plotname;
        QString tbl1_name;
        QString tbl2_name;

        QJsonArray rpkmnames;

        QList<QSharedPointer<REGION> > regions;


        BamReader reader;
        SamHeader header;
        RefVector references;
        QMap<QString,QPair<int,int> > ref_map;
        QSet<int> tids;//Reads from this chromosome (ids) should be twiced
        QSet<int> i_tids;//Reads from this chromosome (ids) should be ignored

        QVector<double> avd_total;
        QVector<QPair<QSharedPointer<REGION>,QVector<quint16> > > avd_matrix;
        QVector<QPair<QSharedPointer<REGION>,QJsonArray > > rpkm_matrix;

};

class ATDPBasics
{
    private:
        EXPERIMENT_INFO* exp_i;// experiment_info;
        int avd_window;
        int avd_whole_region;
        int avd_heat_window;
        QString twicechr;
        QString ignorechr;

//        void getRecordInfo(void);
//        void getRecordsInfo(void);
        void getRegions(void);

    public:

        static void prn_debug(QString ,BamAlignment &);

        ATDPBasics(EXPERIMENT_INFO*);
        void RegionsProcessing(void);
};

/*
inline uint qHash(const REGION &key, uint seed)
{
    return qHash(key.gene_id+key.refseq_id, seed) ^ key.start;
}
*/
#endif // ATDPBASICS_H
