#include "FileWriter.hpp"


//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::~FileWriter()
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QState * parent):
QState(parent),
    hd(&in)
{
    fileName=gArgs().getArgs("out").toString();
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QString _fileName,QState * parent):
QState(parent),
    hd(&in),
    fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
FileWriter::FileWriter(HandledData &in,QString _fileName,ChildMode childmode,QState * parent):
QState(childmode,parent),
    hd(&in),
    fileName(_fileName)
{
}
//-------------------------------------------------------------
//-------------------------------------------------------------
void FileWriter::onEntry(QEvent*)
{
    Load();
}//end of function

//-------------------------------------------------------------
//-------------------------------------------------------------
void FileWriter::Load(void)
{
    for(quint32 h=0;h<hd->height;h++)
    {
        QFile _outFile;
        if(fileName.indexOf("%")>0)
        {
            _outFile.setFileName(fileName.arg(h));
            _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        }
        else
        {
            _outFile.setFileName(fileName);
            _outFile.open(QIODevice::WriteOnly|QIODevice::Append);
        }

        for(quint32 w=0; w< hd->width; w++)
            _outFile.write( (QString("%1\t%2\n").arg(w).arg( hd->data[h][w] )).toLocal8Bit() );

        _outFile.flush();
        _outFile.close();
    }
}

//-------------------------------------------------------------
//-------------------------------------------------------------



