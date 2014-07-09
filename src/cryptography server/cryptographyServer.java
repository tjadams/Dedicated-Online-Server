package tylerTest;

import client.MapleClient;
import constants.ServerConstants;
import net.mina.MapleCodecFactory;
import org.apache.mina.core.buffer.IoBuffer;
import org.apache.mina.core.buffer.SimpleBufferAllocator;
import org.apache.mina.core.filterchain.IoFilter;
import org.apache.mina.core.service.IoAcceptor;
import org.apache.mina.core.service.IoHandlerAdapter;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.core.session.IoSession;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;
import tools.MapleAESOFB;
import tools.MaplePacketCreator;
import tools.data.input.ByteArrayByteStream;
import tools.data.input.GenericSeekableLittleEndianAccessor;
import tools.data.input.SeekableLittleEndianAccessor;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * Created by Tyler Adams on 26/06/2014.
    NOTE: lots of logic here comes from the moopledev source rev 119 since I don't want to worry about encryption.
    Dependencies listed above may be added in future commits.

 */
public class cryptographyServer extends IoHandlerAdapter implements Runnable {

    private static final SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy HH:mm");
    IoAcceptor acceptor;
    static cryptographyServer instance;

    @Override
    public void run() {

        // commence mina boilerplate
        IoBuffer.setUseDirectBuffer(false);
        IoBuffer.setAllocator(new SimpleBufferAllocator());
        acceptor = new NioSocketAcceptor();
        // encryption/decryption
        acceptor.getFilterChain().addLast("codec", new ProtocolCodecFilter(new MapleCodecFactory()));
        // for SessionOpened
        acceptor.setHandler(this);
        try {
            acceptor.bind(new InetSocketAddress(InetAddress.getByName("127.0.0.1"),8485));
        } catch (IOException ex) {
            ex.printStackTrace();
        }

        System.out.println("Encryption server listening on port 8485\n");
    }

    public static void main(String args[]) {

        cryptographyServer.getInstance().run();

    }

    public static cryptographyServer getInstance() {
        if (instance == null) {
            instance = new cryptographyServer();
        }
        return instance;
    }

    @Override
    public void sessionOpened(IoSession session) {
//        session.write(MaplePacketCreator.getHello(ServerConstants.VERSION, ivSend, ivRecv));
        System.out.println("Encryption IoSession with " + session.getRemoteAddress() + " opened on " + sdf.format(Calendar.getInstance().getTime()));
    }

    @Override
    public void messageReceived(IoSession session, Object message) {
        System.out.print("\nReceiving decrypted message: ");

        byte[] content = (byte[]) message;
        for (int i = 0; i < content.length; i++) {
            System.out.print(content[i] + " ");
        }

        SeekableLittleEndianAccessor slea = new GenericSeekableLittleEndianAccessor(new ByteArrayByteStream(content));
        short packetId = slea.readShort();
        System.out.println("packetId: " + packetId + "\n\n");

    }
}