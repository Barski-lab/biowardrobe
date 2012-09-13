#ifndef _Intersections_
#define _Intersections_


#include <config.hpp>

#define FSTM Intersections


typedef bicl::interval_map<int,int> current_segment_type;
typedef QMap<QString, current_segment_type > string_map_segments;

class FSTM: public QObject
{
    Q_OBJECT

private:

    QSqlQuery q;
    QMap<QString,QByteArray> genome;


public slots:

    void start(void);

public:

    FSTM(QObject* parent=0);
    ~FSTM();  

    template<typename T>
    void loadBed(T &,QString);

    void outData(string_map_segments&,string_map_segments&,string_map_segments&,string_map_segments&,int);

signals:
    void finished(void);
};

#endif
